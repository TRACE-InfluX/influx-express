var firebase = require('firebase');

var config = {
    apiKey: "AIzaSyAehd9h99xM3nR7rdsR_Vbab8-b4kgk76I",
    authDomain: "influx-trace.firebaseapp.com",
    databaseURL: "https://influx-trace.firebaseio.com",
    projectId: "influx-trace",
    storageBucket: "influx-trace.appspot.com",
    messagingSenderId: "876821038783"
};
firebase.initializeApp(config);

const db = firebase.database();
module.exports = {
    firebase,
    db
};