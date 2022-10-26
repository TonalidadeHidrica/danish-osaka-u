use std::{collections::HashMap, path::PathBuf};

use aho_corasick::{AhoCorasickBuilder, MatchKind::LeftmostLongest};
use clap::Args;
use danish_dictionary_parser::parse_dictionary::{Entry, OtherForm, Pos};
use itertools::Itertools;
use log::info;
use maplit::hashmap;
use markup5ever::{local_name, namespace_url, ns, LocalName, QualName};
use scraper::{
    node::{Element, Text},
    Html, Node,
};

#[derive(Args)]
pub struct Opts {
    dictionary: PathBuf,
    input: PathBuf,
    output: PathBuf,
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
        let input = opts.input.to_string_lossy();
        let lands = glob::glob(&format!("{input}/lands/*.html"))?;
        let lessons = glob::glob(&format!("{input}/lesson*/*.html"))?;
        for input in lands.chain(lessons) {
            let input = input?;
            let output = opts.output.join(input.strip_prefix(&opts.input)?);
            run_file(&words, &aho, &input, &output)?;
        }
    } else {
        run_file(&words, &aho, &opts.input, &opts.output)?;
    }

    Ok(())
}

fn html_tag(local: LocalName) -> QualName {
    QualName {
        prefix: None,
        ns: ns!(html),
        local,
    }
}
fn html_attr(local: LocalName) -> QualName {
    QualName {
        prefix: None,
        ns: ns!(),
        local,
    }
}

fn run_file(
    words: &WordMap,
    aho: &aho_corasick::AhoCorasick,
    input: &PathBuf,
    output: &PathBuf,
) -> Result<(), anyhow::Error> {
    info!("Processing {input:?}");

    let element_default = Element {
        name: html_tag(local_name!("html")), // dummy
        id: None,
        classes: Default::default(),
        attrs: Default::default(),
    };

    let mut html = Html::parse_document(&fs_err::read_to_string(&input)?);

    let ids = html
        .tree
        .root()
        .descendants()
        .filter_map(|x| x.value().is_text().then_some(x.id()))
        .collect_vec();
    for id in ids {
        let mut replaced = html.tree.get_mut(id).unwrap();
        let text = replaced.value().as_text().unwrap().to_owned();
        let text_for_search = text.to_lowercase();
        let mut i = 0;
        for m in aho.find_iter(text_for_search.as_bytes()) {
            if i < m.start() {
                replaced.insert_before(Node::Text(Text {
                    text: text[i..m.start()].into(),
                }));
            }
            let prons = &words[&text_for_search[m.start()..m.end()]];
            let mut ruby = replaced.insert_before(Node::Element(Element {
                name: html_tag(local_name!("ruby")),
                attrs: hashmap![
                    html_attr("data-candidates".into()) => serde_json::to_string(&prons)?.into(),
                ],
                ..element_default.clone()
            }));
            ruby.append(Node::Text(Text {
                text: text[m.start()..m.end()].into(),
            }));
            let mut rt = ruby.append(Node::Element(Element {
                name: html_tag(local_name!("rt")),
                ..element_default.clone()
            }));
            if !prons.is_empty() && prons.iter().map(|x| x.1).all_equal() {
                if let Some(&pron) = prons[0].1.first() {
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

    // Insert custom CSS
    let head = html.select(selector!("head")).next().unwrap().id();
    let mut head = html.tree.get_mut(head).unwrap();
    head.append(Node::Element(Element {
        name: html_tag(local_name!("link")),
        attrs: hashmap![
            html_attr(local_name!("rel")) => "stylesheet".into(),
            html_attr(local_name!("href")) => "../../patch/common.css".into(),
        ],
        ..element_default.clone()
    }));
    head.append(Node::Element(Element {
        name: html_tag(local_name!("script")),
        attrs: hashmap![
            html_attr(local_name!("src")) => "../../patch/common.js".into(),
        ],
        ..element_default
    }));

    if let Some(parent) = output.parent() {
        fs_err::create_dir_all(parent)?;
    }
    fs_err::write(output, html.html())?;
    Ok(())
}

type WordMap<'a> = HashMap<String, Vec<(&'a Vec<Pos>, &'a Vec<&'a str>)>>;
fn to_map<'a>(words: &'a [Entry]) -> WordMap<'a> {
    let mut map: WordMap = HashMap::new();
    for word in words {
        if !word.pronunciations.is_empty() {
            map.entry(word.word.to_lowercase())
                .or_default()
                .push((&word.pos, &word.pronunciations));
        }
        for form in &word.other_forms {
            process_other_form(&mut map, &word.pos, form);
        }
        for form in &word.other_adjective_forms {
            process_other_form(&mut map, &word.pos, form);
        }
    }
    map
}
pub fn process_other_form<'a>(map: &mut WordMap<'a>, pos: &'a Vec<Pos>, form: &'a OtherForm) {
    if !form.pronunciations.is_empty() {
        map.entry(form.word.to_lowercase())
            .or_default()
            .push((pos, &form.pronunciations));
    }
    for form in &form.slahsed {
        process_other_form(map, pos, form);
    }
}
