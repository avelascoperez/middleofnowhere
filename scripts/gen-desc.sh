#!/bin/bash

# The base assets directory
ASSETS_DIR="assets"

# The markdown content (lorem ipsum)
read -r -d '' LOREM_MD << EOM
# Project Description

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisi consectetur nisi, euismod euismod nisi nisi euismod.

- Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
- Etiam at risus et justo dignissim congue.
- Donec congue lacinia dui, a porttitor lectus condimentum laoreet.

**Suspendisse potenti.**
EOM

# Loop through each subdirectory in the assets directory
for DIR in "$ASSETS_DIR"/*/; do
  # Check if it's a directory
  if [ -d "$DIR" ]; then
    echo "$LOREM_MD" > "${DIR}description.md"
    echo "Wrote ${DIR}description.md"
  fi
done
