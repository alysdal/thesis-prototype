# Machine learning with vibration patterns

Run program with `php -S 0.0.0.0:8000`

Compile js with `npm run dev`

## Machine learning

`node record.js` records incoming messages on the mqtt broker (should be running continually)

`node ml.js` trains a model using the classified data and classifies all rows in database

`node ml.js --classify` classifies all rows in database using latest model.
