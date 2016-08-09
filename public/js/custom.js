var colors = [
    "red","blue","green","orange", // 0 1 2 3  
    "pink", "purple", "light-blue", "cyan", // 4 5 6 7  
    "deep-purple", "indigo", "teal", "lime", // 8 9 10 11
    "light-green", "yellow", "amber", "deep-orange", // 12 13 14 15
    "brown", "grey", "blue-grey", "black"      // 16 17 18 19
];

var i = getRandomInteger(0,19);
i = 10;
var COLOR = colors[i].toString();

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}