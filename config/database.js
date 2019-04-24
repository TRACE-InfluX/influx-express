var firebase = require('firebase');

var config = {
    apiKey: "",
    authDomain: "influx-trace.firebaseapp.com",
    databaseURL: "https://influx-trace.firebaseio.com",
    projectId: "influx-trace",
    storageBucket: "influx-trace.appspot.com",
    messagingSenderId: ""
};
firebase.initializeApp(config);

const db = firebase.database();
module.exports = {
    firebase,
    db
};
