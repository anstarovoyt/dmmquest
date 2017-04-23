var expectedClosedTime = "10:00";


var actualClosedTime1 = "10:00"; //0
var actualClosedTime2 = "10:01"; //0,5
var actualClosedTime3 = "10:10"; //0,5
var actualClosedTime4 = "10:11"; //1
var actualClosedTime5 = "10:19"; //1
var actualClosedTime6 = "10:20"; //1
var actualClosedTime7 = "10:21"; //2


var moment = require('moment');

function calc(expectedClosedTime, actualClosedTime) {

    var expected = moment(expectedClosedTime, "HH:mm");
    var actual = moment(actualClosedTime, "HH:mm");

    var fidd = actual.diff(expected, 'minutes');

    if (fidd === 0) return 0;

    return (Math.floor(((fidd - 0.1)) / 10) + 1) / 2;
}

console.log(calc(expectedClosedTime, actualClosedTime1));
console.log(calc(expectedClosedTime, actualClosedTime2));
console.log(calc(expectedClosedTime, actualClosedTime3));
console.log(calc(expectedClosedTime, actualClosedTime4));
console.log(calc(expectedClosedTime, actualClosedTime5));
console.log(calc(expectedClosedTime, actualClosedTime6));
console.log(calc(expectedClosedTime, actualClosedTime7));