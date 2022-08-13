use std::{
    collections::{HashMap, VecDeque},
    path::PathBuf,
};

use anyhow::Context;
use clap::Parser;
use regex::Regex;
use reqwest::{blocking::get as get_blocking, Url};
use scraper::Html;

#[derive(Parser)]
struct Opts {
    directory: PathBuf,
}

fn main() -> anyhow::Result<()> {
    let opts = Opts::parse();

    let base_url = Url::parse("http://el.minoh.osaka-u.ac.jp/wl/")?;
    let mut urls = VecDeque::new();
    urls.push_back((base_url.join("da/index.html")?, true));

    let oq_compooser_url = base_url.join("da/oq-composer/index.js")?;
    urls.push_back((oq_compooser_url.clone(), false));
    let toc_map = toc_map(oq_compooser_url)?;
    println!("{:?}", toc_map);
    return Ok(());

    while let Some((url, is_html)) = urls.pop_front() {
        let save_path: PathBuf =
            opts.directory
                .join(url.make_relative(&base_url).with_context(|| {
                    format!("The url {url:?} does not start with {base_url:?}")
                })?);
        let res = get_blocking(url)?.text()?;
        fs_err::write(save_path, &res)?;

        let html = Html::parse_document(&res);
    }

    Ok(())
}

#[derive(PartialEq, Eq, Debug, Hash)]
struct TocKey(String);
#[derive(Debug)]
struct TocPath(PathBuf);

fn toc_map(base_url: Url) -> anyhow::Result<HashMap<TocKey, TocPath>> {
    let js = get_blocking(base_url)?.text()?;
    let regex = Regex::new(r"\(\d+, \d+, '(?P<key>[^']+)', .*, \[\[\d+, '(?P<value>[^']+)'\]\].*\)")?;
    Ok(regex
        .captures_iter(&js)
        .map(|c| {
            (
                TocKey(c["key"].to_owned()),
                TocPath(PathBuf::from(c["value"].to_owned())),
            )
        })
        .collect())
}
