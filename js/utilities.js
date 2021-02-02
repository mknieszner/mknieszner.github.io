const changeBrowserColor = function (color) {
    const oldMeta = document.getElementsByName('theme-color')[0];
    document.getElementsByTagName('head')[0].removeChild(oldMeta);

    const newMeta = document.createElement('meta');
    newMeta.name = "theme-color";
    newMeta.content = color;
    document.getElementsByTagName('head')[0].appendChild(newMeta);
};

const rotateYElem = function (element, transformString) {
    let rotateYString = 'rotateY(' + transformString + ')';

    element.style.webkitTransform = rotateYString;
    element.style.MozTransform = rotateYString;
    element.style.msTransform = rotateYString;
    element.style.OTransform = rotateYString;
    element.style.transform = rotateYString;
};

// set up text to print, each item in array is new line
const aText = new Array(
    "PL BIO Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium beatae dicta expedita libero maiores nam nobis recusandae similique vero vitae. Architecto assumenda aut istinctio facere fugiat quae quasi veniam vero. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium beatae dicta expedita libero maiores nam nobis recusandae similique vero vitae. Architecto assumenda aut distinctio facere fugiat quae quasi veniam vero."
);

var iSpeed = 30; // time delay of print out
var iIndex = 0; // start printing array at this posision
var iArrLength = aText[0].length; // the length of the text array
var iScrollAt = 20; // start scrolling up at this many lines

var iTextPos = 0; // initialise text position
var sContents = ''; // initialise contents variable
var iRow; // initialise current row

function typeContent(contentId)
{
    sContents =  ' ';
    iRow = Math.max(0, iIndex-iScrollAt);
    var destination = document.getElementById(contentId);

    while ( iRow < iIndex ) {
        sContents += aText[iRow++] + '<br />';
    }
    destination.innerHTML = sContents + aText[iIndex].substring(0, iTextPos) + "_";
    if ( iTextPos++ === iArrLength ) {
        iTextPos = 0;
        iIndex++;
        if ( iIndex !== aText.length || destination.getAttribute("typed") === "true") {
            iArrLength = aText[iIndex].length;
            setTimeout("typeContent(contentId)", 500);
        } else {
            destination.setAttribute("typed", "true");
        }
    } else {
        setTimeout("typeContent(contentId)", iSpeed);
    }
}

const onPageScroll = function () {
    let colors = ['#436186', '#500778', '#418910', '#651d32', '#d4af37'];
    let touchLastX;
    let touchStartX;
    let touchStartY;
    let touchLastY;
    let fronts = document.getElementsByClassName('card__side--front');
    let backs = document.getElementsByClassName('card__side--back');
    let containers = document.getElementsByClassName('card-container');

    let nowPageNr = 0;
    let nowIsFront = true;
    let nextPageNr;
    let nextIsFront;

    document.querySelector('main').addEventListener('touchstart', () => {

        touchStartX = event.touches[0].pageX;
        touchStartY = event.touches[0].pageY;
    },  {passive: true});

    document.querySelector('main').addEventListener('touchend', () =>  {
        touchLastX = event.changedTouches[0].pageX;
        touchLastY = event.changedTouches[0].pageY;

        if (!touchStartX || !touchLastX || !touchStartY || !touchLastY || Math.abs(touchStartX - touchLastX) <= Math.abs(touchStartY - touchLastY)) {
            displayScrollHint();
            return
        }

        let moveDown = (touchStartX - touchLastX) > 0;
        if (moveDown) {
            containers[nowPageNr].style.zIndex = 10;
            nextPageNr = nowIsFront ? nowPageNr : nowPageNr + 1;
            nextIsFront = !nowIsFront;
            if (nextPageNr !== backs.length) {
                nextPageNr = nowIsFront ? nowPageNr : nowPageNr + 1;
                nextIsFront = !nowIsFront;
                if (nowIsFront) {
                    rotateYElem(fronts[nowPageNr], "-180deg");
                    rotateYElem(backs[nowPageNr], "0deg");
                } else {
                    rotateYElem(fronts[nextPageNr], "0deg");
                    rotateYElem(backs[nowPageNr], "-180deg");
                }
                nowIsFront = nextIsFront;
                nowPageNr = nextPageNr;
            }
        } else {
            nextPageNr = nowIsFront ? nowPageNr - 1 : nowPageNr;
            nextIsFront = !nowIsFront;
            if (nextPageNr !== -1) {
                if (nowIsFront) {
                    rotateYElem(fronts[nowPageNr], "180deg");
                    rotateYElem(backs[nextPageNr], "0deg");
                } else {
                    rotateYElem(fronts[nextPageNr], "0deg");
                    rotateYElem(backs[nowPageNr], "180deg");
                }
                nowIsFront = nextIsFront;
                nowPageNr = nextPageNr;
            }
        }
        changeBrowserColor(colors[nowPageNr]);
    }, {passive: true});

};

const containsInArray = function (firstArray, secondArray) {
    for (let element of firstArray) {
        if (secondArray.includes(element)) {
            return true;
        }
    }
    return false;
};

const findAllByClassNameAndChangeVisibility = function (className, displayIfContains, displayIfNotContains, exceptions) {
    const all = document.getElementsByClassName(className);
    for (let i = 0; i < all.length; i++) {
        if (containsInArray(all[i].classList, exceptions)) {
            all[i].style.display = displayIfContains;
        } else {
            all[i].style.display = displayIfNotContains;
        }
    }
};

const displayScrollHint = function () {
    const scrollClass = "scroll-right";
    const scrollElem = document.getElementsByClassName(scrollClass)[0];
    if (scrollElem.classList.contains('animated')) {
        return
    }
    scrollElem.classList.add('animated');
    setTimeout(function () {
        scrollElem.classList.remove('animated')
    }, 1500);
};

const hideAllNonSelectedLanguageTexts = function (lang) {
    const langClass = "translate";
    const selectedLangClass = "translate-" + lang.toLowerCase();
    findAllByClassNameAndChangeVisibility(langClass, "block", "none", [selectedLangClass]);
};

const hideSelectedLanguageButton = function (lang) {
    const langButtonClass = "btn--lang";
    const selectedLangButtonClass = "btn--lang-" + lang.toLowerCase();
    findAllByClassNameAndChangeVisibility(langButtonClass, "none", "block", [selectedLangButtonClass]);
};

const changeLang = function (lang) {
    hideAllNonSelectedLanguageTexts(lang);
    hideSelectedLanguageButton(lang);
};

function openInNewWindow(url) {
    const win = window.open(url, '_blank');
    win.focus();
}

changeLang("PL");
onPageScroll();
