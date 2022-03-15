1. bash getAllMarkets.sh

This queries ZigZag for all active markets, saves the output to a file called 'allpairs'

2. node parseMarkets.js

This tidies things up into a file called pairs.json

3. node cryptoWatch.js

For each pair, we query cryptowatch for the available markets, and return the 1st and 2nd most reliable pricefeeds (measured by volume). Saves this output to newMarkets.json

4. node configGenerator.js

Takes newMarkets.json and prints to console a pair config according to some user variables (set on lines 22-24 and 53). 