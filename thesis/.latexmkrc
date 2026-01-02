# Local latexmk configuration for this thesis
# - Force biber (biblatex backend)
# - Use an available UTF-8 locale to avoid Perl/Biber locale warnings

$bibtex_use = 2;

# Debian/TeXLive images often have only C.utf8 available
$biber = 'env LANG=C.utf8 LC_ALL=C.utf8 biber %O %S';

# Keep pdflatex flags consistent with CI/terminal usage
$pdflatex = 'pdflatex -interaction=nonstopmode -halt-on-error %O %S';
