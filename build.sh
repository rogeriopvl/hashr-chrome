#!/bin/bash
zip -r build/hashr-chrome-$1.zip manifest.json popup.html js/ images/ -x .DS_Store .gitignore \*/.DS_Store