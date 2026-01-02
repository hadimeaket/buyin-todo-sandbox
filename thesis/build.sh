#!/usr/bin/env bash
set -euo pipefail

# Ensure an available UTF-8 locale to avoid Perl (latexmk/biber) locale warnings
export LANG=C.utf8
export LC_ALL=C.utf8

latexmk -pdf -interaction=nonstopmode -halt-on-error main.tex
