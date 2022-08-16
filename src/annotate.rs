use std::{collections::HashMap, path::PathBuf};

use aho_corasick::{AhoCorasickBuilder, MatchKind::LeftmostLongest};
use clap::Args;
use danish_dictionary_parser::parse_dictionary::{Entry, OtherForm};
use itertools::Itertools;
use markup5ever::{interface::QuirksMode, local_name, namespace_url, ns, QualName};
use scraper::{
    node::{Element, Text},
    Html, Node,
};

#[derive(Args)]
pub struct Opts {
    dictionary: PathBuf,
    file: PathBuf,
}

pub fn main(opts: Opts) -> anyhow::Result<()> {
    let dictionary = fs_err::read_to_string(&opts.dictionary)?;
    let dictionary: Vec<Entry> = serde_json::from_str(&dictionary)?;
    let words = to_map(&dictionary);
    let aho = AhoCorasickBuilder::new()
        .match_kind(LeftmostLongest)
        .build(words.keys());

    let mut html = Html::parse_document(&fs_err::read_to_string(&opts.file)?).tree;
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
            if let Some(&pron) = words[&text_for_search[m.start()..m.end()]].first() {
                rt.append(Node::Text(Text { text: pron.into() }));
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
    fs_err::write(opts.file, html.html())?;

    Ok(())
}

type WordMap<'a> = HashMap<String, &'a Vec<&'a str>>;
fn to_map<'a>(words: &'a [Entry]) -> WordMap<'a> {
    let mut map = HashMap::new();
    for word in words {
        map.insert(word.word.to_lowercase(), &word.pronunciations);
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
    map.insert(form.word.to_lowercase(), &form.pronunciations);
    for form in &form.slahsed {
        process_other_form(map, form);
    }
}
