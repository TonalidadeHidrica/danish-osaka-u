use clap::{Parser, Subcommand};
use danish_osaka_u_crawler::{annotate, crawl};

#[derive(Parser)]
struct Opts {
    #[clap(subcommand)]
    subcommand: Sub,
}

#[derive(Subcommand)]
enum Sub {
    Crawl(crawl::Opts),
    Annotate(annotate::Opts),
}

pub fn main() -> anyhow::Result<()> {
    env_logger::init();
    use Sub::*;
    match Opts::parse().subcommand {
        Crawl(opts) => crawl::main(opts),
        Annotate(opts) => annotate::main(opts),
    }
}
