use std::{collections::HashMap, path::PathBuf};

use aho_corasick::{AhoCorasickBuilder, MatchKind::LeftmostLongest};
use clap::Args;
use danish_dictionary_parser::parse_dictionary::{Entry, OtherForm};
use itertools::Itertools;
use log::info;
use markup5ever::{interface::QuirksMode, local_name, namespace_url, ns, QualName};
use scraper::{
    node::{Element, Text},
    Html, Node,
};

#[derive(Args)]
pub struct Opts {
    dictionary: PathBuf,
    file: PathBuf,
    #[clap(short, long)]
    recursive: bool,
}

pub fn main(opts: Opts) -> anyhow::Result<()> {
    let dictionary = fs_err::read_to_string(&opts.dictionary)?;
    let dictionary: Vec<Entry> = serde_json::from_str(&dictionary)?;
    let words = to_map(&dictionary);
    let aho = AhoCorasickBuilder::new()
        .match_kind(LeftmostLongest)
        .build(words.keys());

    if opts.recursive {
        let dir = opts.file.to_string_lossy();
        let lands = glob::glob(&format!("{dir}/lands/*.html"))?;
        let lessons = glob::glob(&format!("{dir}/lesson*/*.html"))?;
        for file in lands.chain(lessons) {
            run_file(&words, &aho, &file?)?;
        }
    } else {
        run_file(&words, &aho, &opts.file)?;
    }

    Ok(())
}

fn run_file(
    words: &HashMap<String, Vec<&Vec<&str>>>,
    aho: &aho_corasick::AhoCorasick,
    file: &PathBuf,
) -> Result<(), anyhow::Error> {
    info!("Processing {file:?}");

    let mut html = Html::parse_document(&fs_err::read_to_string(&file)?).tree;
    let ids = html
        .root()
        .descendants()
        .filter_map(|x| x.value().is_text().then_some(x.id()))
        .collect_vec();
    for id in ids {
        let mut replaced = html.get_mut(id).unwrap();
        let text = replaced.value().as_text().unwrap().to_owned();
        let text_for_search = text.to_lowercase();
        let mut i = 0;
        for m in aho.find_iter(text_for_search.as_bytes()) {
            if i < m.start() {
                replaced.insert_before(Node::Text(Text {
                    text: text[i..m.start()].into(),
                }));
            }
            let mut ruby = replaced.insert_before(Node::Element(Element {
                name: QualName {
                    prefix: None,
                    ns: ns!(html),
                    local: local_name!("ruby"),
                },
                id: None,
                classes: Default::default(),
                attrs: Default::default(),
            }));
            ruby.append(Node::Text(Text {
                text: text[m.start()..m.end()].into(),
            }));
            let mut rt = ruby.append(Node::Element(Element {
                name: QualName {
                    prefix: None,
                    ns: ns!(html),
                    local: local_name!("rt"),
                },
                id: None,
                classes: Default::default(),
                attrs: Default::default(),
            }));
            let prons = &words[&text_for_search[m.start()..m.end()]];
            if prons.len() == 1 {
                if let Some(&pron) = prons[0].first() {
                    rt.append(Node::Text(Text { text: pron.into() }));
                }
            }
            i = m.end();
        }
        if i < text.len() {
            replaced.insert_before(Node::Text(Text {
                text: text[i..].into(),
            }));
        }
        replaced.detach();
    }
    let html = Html {
        errors: vec![],
        quirks_mode: QuirksMode::NoQuirks,
        tree: html,
    };
    fs_err::write(file, html.html())?;
    Ok(())
}

type WordMap<'a> = HashMap<String, Vec<&'a Vec<&'a str>>>;
fn to_map<'a>(words: &'a [Entry]) -> WordMap<'a> {
    let mut map: WordMap = HashMap::new();
    for word in words {
        map.entry(word.word.to_lowercase())
            .or_default()
            .push(&word.pronunciations);
        for form in &word.other_forms {
            process_other_form(&mut map, form);
        }
        for form in &word.other_adjective_forms {
            process_other_form(&mut map, form);
        }
    }
    map
}
pub fn process_other_form<'a>(map: &mut WordMap<'a>, form: &'a OtherForm) {
    map.entry(form.word.to_lowercase())
        .or_default()
        .push(&form.pronunciations);
    for form in &form.slahsed {
        process_other_form(map, form);
    }
}
