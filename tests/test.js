var expectedClosedTime = "10:40";
var actualClosedTime = "10:50";


var moment = require('moment');

var expected = moment(expectedClosedTime, "HH:mm");
var actual = moment(actualClosedTime, "HH:mm");

var fidd = actual.diff(expected, 'minutes');

console.log(Math.floor(fidd / 10) + 1);