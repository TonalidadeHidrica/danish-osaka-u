use std::{
    borrow::Borrow,
    collections::{HashMap, HashSet, VecDeque},
    path::PathBuf,
    time::Duration,
};

use clap::Parser;
use log::{info, warn};
use regex::Regex;
use reqwest::{blocking::get as get_blocking, header::CONTENT_TYPE, Url};
use scraper::Html;

#[derive(Parser)]
struct Opts {
    directory: PathBuf,
}

macro_rules! selector {
    ($e: expr) => {{
        use ::once_cell::sync::Lazy;
        use ::scraper::Selector;
        static SELECTOR: Lazy<Selector> = Lazy::new(|| Selector::parse($e).unwrap());
        &*SELECTOR
    }};
}

fn main() -> anyhow::Result<()> {
    env_logger::init();
    let opts = Opts::parse();

    let base_url = Url::parse("http://el.minoh.osaka-u.ac.jp/wl/da/")?;
    let mut urls = VecDeque::new();
    let mut collected_urls = HashSet::new();

    let top_url = base_url.join("index.html")?;
    let oq_compooser_url = base_url.join("oq-composer/index.js")?;
    let video_player_url = base_url.join("common/video640.html")?;

    urls.push_back(top_url.clone());
    urls.push_back(oq_compooser_url.clone());
    urls.push_back(video_player_url.clone());

    let toc_map = toc_map(oq_compooser_url)?;
    for path in toc_map.values() {
        urls.push_back(base_url.join(&path.0)?);
    }

    // Manually add
    urls.push_back(base_url.join("../oq-composer/oq-composer.css")?);
    urls.push_back(base_url.join("../oq-composer/oq-composer.js")?);
    urls.push_back(base_url.join("common/base.css")?);
    urls.push_back(base_url.join("common/layout.css")?);
    urls.push_back(base_url.join("common/icon150-02.png")?);
    urls.push_back(base_url.join("common/icon64.png")?);

    while let Some(url) = urls.pop_front() {
        if !collected_urls.insert(url.clone()) {
            continue;
        }
        info!("Crawling {url}");

        let save_path = match base_url.make_relative(&url) {
            Some(p) if !p.starts_with("..") || p.starts_with("../oq-composer/") => {
                opts.directory.join(p)
            }
            _ => {
                info!("Skipping {url} because it does not start with {base_url}");
                continue;
            }
        };
        let res = get_blocking(url.clone())?;
        let is_html = res
            .headers()
            .get(CONTENT_TYPE)
            .map_or(false, |x| x.as_bytes().starts_with(b"text/html"));
        let res = res.bytes()?;
        if let Some(parent) = save_path.parent() {
            fs_err::create_dir_all(parent)?;
        }
        info!("Saving to {save_path:?}");
        fs_err::write(save_path, &res)?;
        std::thread::sleep(Duration::from_secs_f64(0.5));

        if !is_html {
            continue;
        }

        info!("Parsing {url}");
        let html = Html::parse_document(&String::from_utf8_lossy(&res));
        let href = html
            .select(selector!(r#"link[rel="stylesheet"], a"#))
            .filter_map(|x| x.value().attr("href"));
        let src = html
            .select(selector!(r#"audio, img, script[type="text/javascript"]"#))
            .filter_map(|x| x.value().attr("src"));
        for relative in href.chain(src) {
            let original_url = url.join(relative)?;
            let mut query_pairs = original_url.query_pairs();
            let url = {
                let mut url = original_url.clone();
                url.set_query(None);
                url.set_fragment(None);
                url
            };
            let url = if url == top_url {
                if let Some(key) = query_pairs.find_map(|(k, v)| (k == "page").then_some(v)) {
                    if let Some(url) = toc_map.get(key.as_ref()) {
                        top_url.join(&url.0)?
                    } else {
                        warn!("Unresolved {key:?}");
                        continue;
                    }
                } else {
                    url
                }
            } else if url == video_player_url {
                if let Some(src) = query_pairs.find_map(|(k, v)| (k == "src").then_some(v)) {
                    video_player_url.join(&src)?
                } else {
                    warn!("Link to video640.html without src: {original_url}");
                    continue;
                }
            } else {
                url
            };
            urls.push_back(url);
        }
    }

    Ok(())
}

#[derive(PartialEq, Eq, Debug, Hash)]
struct TocKey(String);
impl Borrow<str> for TocKey {
    fn borrow(&self) -> &str {
        &self.0
    }
}
#[derive(Debug)]
struct TocPath(String);

fn toc_map(base_url: Url) -> anyhow::Result<HashMap<TocKey, TocPath>> {
    let js = get_blocking(base_url)?.text()?;
    let regex =
        Regex::new(r"\(\d+, \d+, '(?P<key>[^']+)', .*, \[\[\d+, '(?P<value>[^']+)'\]\].*\)")?;
    Ok(regex
        .captures_iter(&js)
        .map(|c| (TocKey(c["key"].into()), TocPath(c["value"].into())))
        .collect())
}
