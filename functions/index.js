const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const emails = new Set(['wimhoringa@gmail.com', 'pkhoringa@gmail.com']);
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://wims-test-2c2e4.firebaseio.com'
});

exports.setCustomClaims = functions.auth.user().onCreate(user => {
  let promise = Promise.resolve();
  if (emails.has(user.email)) {
    promise = admin
      .auth()
      .setCustomUserClaims(user.uid, { admin: true })
      .then(() => true);
  }

  return promise;
});

exports.Google_T2S = functions.firestore.document('pois/{ID}').onUpdate((change, context) => {

  // if shouldn't convert, don't convert...
  if (!change.after.data().description.convertToVoice)
    return;


  const newData = change.after.data().description != null && change.before.data().description == null
  const changedData = change.after.data().description != change.before.data().description
  const convertToVoiceSet = change.after.data().convertToVoice
  if (newData || changedData || convertToVoiceSet) {
    // TODO, check for description_nl or description_en type fields, and convert accordingly

    async function textToSpeechRequest() {
      try {
        const text = change.after.data().description; // the text
        const language = 'nl-NL';
        const longLanguage = 'Dutch';
        const audioFormat = '.mp3';
        // copied from https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries#client-libraries-usage-nodejs
        const util = require('util');
        const textToSpeech = require('@google-cloud/text-to-speech'); // Imports the Google Cloud client library
        const client = new textToSpeech.TextToSpeechClient(); // Creates a client

        let fileName = change.after.data().title.replace(/ /g, "_"); // replace spaces with underscores in the file name
        fileName = myWordFile.toLowerCase(); // convert the file name to lower case
        fileName = myWordFile + audioFormat; // append .mp3 to the file name;

        // copied from https://cloud.google.com/blog/products/gcp/use-google-cloud-client-libraries-to-store-files-save-entities-and-log-data
        const { Storage } = require('@google-cloud/storage');
        const storage = new Storage();
        const bucket = storage.bucket('voice');
        var file = bucket.file(language + '/' + fileName);

        const request = { // Construct the request
          input: { text },
          // Select the language and SSML Voice Gender (optional)
          voice: { languageCode: language, ssmlGender: 'FEMALE' },
          // Select the type of audio encoding
          audioConfig: { audioEncoding: 'MP3' },
        };

        const options = { // construct the file to write
          metadata: {
            contentType: 'audio/mpeg',
            metadata: {
              source: 'Google Text-to-Speech'
            }
          }
        };

        // copied from https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries#client-libraries-usage-nodejs
        const [response] = await client.synthesizeSpeech(request);
        // Write the binary audio content to a local file
        // response.audioContent is the downloaded file
        return await file.save(response.audioContent, options)
          .then(function () {
            change.after.update({ voiceFile: file })
            console.log("File written to Firebase Storage.")
          })
          .catch(function (error) {
            console.error(error);
          });
      } // close try
      catch (error) {
        console.error(error);
      } // close catch
    } // close async
    textToSpeechRequest();
  } // close if
}); // close Google_T2S
