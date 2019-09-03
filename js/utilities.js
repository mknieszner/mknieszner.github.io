var deferredPrompt;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function () {
            console.log('Service worker registered!');
        })
        .catch(function(err) {
            console.log(err);
        });
}

window.addEventListener('beforeinstallprompt', function (event) {
    console.log('beforeinstallprompt fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});


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

const displayElem = function (element, transformString) {
    element.style.display = transformString;
};

const onPageScroll = function () {
    let colors = ['#436186', '#418910', '#651d32', '#500778', '#d4af37'];
    let touchLastX;
    let touchStartX;
    let fronts = document.getElementsByClassName('card__side--front');
    let backs = document.getElementsByClassName('card__side--back');

    let nowPageNr = 0;
    let nowIsFront = true;
    let nextPageNr;
    let nextIsFront;
    const bodyEl = document.querySelector('main');
    bodyEl.ontouchmove = (event) => {
        touchLastX = event.touches[0].screenX;
    };

    bodyEl.ontouchstart = (event) => {
        touchStartX = event.touches[0].screenX;
    };

    bodyEl.ontouchend = () => {
        console.log('move');
        let moveDown = (touchStartX - touchLastX) > 0;
        if (moveDown) {
            nextPageNr = nowIsFront ? nowPageNr : nowPageNr + 1;
            nextIsFront = !nowIsFront;
            if (nextPageNr !== backs.length) {
                nextPageNr = nowIsFront ? nowPageNr : nowPageNr + 1;
                nextIsFront = !nowIsFront;
                // console.log('down move');
                // console.log(nowIsFront);
                // console.log(nowPageNr);
                // console.log(nextIsFront);
                // console.log(nextPageNr);
                if (nowIsFront) {
                    rotateYElem(fronts[nowPageNr], "-180deg");
                    rotateYElem(backs[nowPageNr], "0deg");
                } else {
                    rotateYElem(fronts[nextPageNr], "0deg");
                    rotateYElem(backs[nowPageNr],"-180deg");
                }
                nowIsFront = nextIsFront;
                nowPageNr = nextPageNr;
            }
        } else {
            nextPageNr = nowIsFront ? nowPageNr - 1 : nowPageNr;
            nextIsFront = !nowIsFront;
            // console.log('up move');
            // console.log(nowIsFront);
            // console.log(nowPageNr);
            // console.log(nextIsFront);
            // console.log(nextPageNr);
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
    }

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

function openMyJiraInNewWindow() {
    const win = window.open('http://my-jira.knieszner.pl/', '_blank');
    win.focus();
}

function fetchMyJiraStatus(url, timeout, limit) {
    fetch(url)
        .then(function (response) {
            if (response.status !== 200 && limit) {
                setTimeout(fetchMyJiraStatus(url, timeout, --limit), timeout);
            }
            return response.json()
        })
        .then(function (running) {
            if (running) {
                displayElem(document.getElementById('my-jira-link-not-ready'), 'none');
                displayElem(document.getElementById('my-jira-link-ready'), 'block');
            } else {
                throw Error('Api exception');
            }
        })
        .catch(function () {
            displayElem(document.getElementById('my-jira-link-not-ready'), 'flex');
            displayElem(document.getElementById('my-jira-link-ready'), 'none');
        })
}

const initMyJira = function () {
    fetchMyJiraStatus('https://my-jira.herokuapp.com/health/running', 10000, 10);
    changeLang("PL");
};

initMyJira();
onPageScroll();
