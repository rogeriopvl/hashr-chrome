#!/bin/bash
zip -r build/hashr-chrome-$1.zip manifest.json popup.html js/ styles/ fonts/ images/ -x .DS_Store .gitignore \*/.DS_Store
