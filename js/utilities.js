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

const changeBrowserColor = function (color) {
    const oldMeta = document.getElementsByName('theme-color')[0];
    document.getElementsByTagName('head')[0].removeChild(oldMeta);

    const newMeta = document.createElement('meta');
    newMeta.name = "theme-color";
    newMeta.content = color;
    document.getElementsByTagName('head')[0].appendChild(newMeta);
};

const onPageScroll = function () {
    let colors = ['#436186', '#418910', '#651d32', '#500778', '#d4af37'];
    let touchLastX;
    let touchStartX;
    let fronts = document.getElementsByClassName('card__side--front');
    let backs = document.getElementsByClassName('card__side--back');

    if (window.matchMedia("(max-width: 37.5em)").matches) {
        for (let i = 0; i < fronts.length; i++) {
            fronts[i].style.transform = "rotateY(180deg)";
            backs[i].style.transform = "rotateY(180deg)";
        }
        fronts[0].style.transform = "rotateY(0deg)";
        backs[0].style.transform = "rotateY(180deg)";
    }

    changeBrowserColor(colors[0]);


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
        console.log('ruch');
        let rotateDirection = (touchStartX - touchLastX) > 0;
        if (rotateDirection) {
            nextPageNr = nowIsFront ? nowPageNr : nowPageNr + 1;
            nextIsFront = !nowIsFront;
            if (nextPageNr !== backs.length) {
                nextPageNr = nowIsFront ? nowPageNr : nowPageNr + 1;
                nextIsFront = !nowIsFront;
                // console.log('ruch na dół');
                // console.log('teraz jest');
                // console.log(nowIsFront);
                // console.log(nowPageNr);
                // console.log('teraz bedzie');
                // console.log(nextIsFront);
                // console.log(nextPageNr);

                if (nowIsFront) {
                    fronts[nowPageNr].style.transform = "rotateY(-180deg)";
                    backs[nowPageNr].style.transform = "rotateY(0deg)";
                } else {
                    fronts[nextPageNr].style.transform = "rotateY(0deg)";
                    backs[nowPageNr].style.transform = "rotateY(-180deg)";
                }
                nowIsFront = nextIsFront;
                nowPageNr = nextPageNr;
            }
        } else {
            nextPageNr = nowIsFront ? nowPageNr - 1 : nowPageNr;
            nextIsFront = !nowIsFront;
            // console.log('ruch do góry');
            // console.log('teraz jest');
            // console.log(nowIsFront);
            // console.log(nowPageNr);
            // console.log('teraz bedzie');
            // console.log(nextIsFront);
            // console.log(nextPageNr);
            if (nextPageNr !== -1) {
                if (nowIsFront) {
                    fronts[nowPageNr].style.transform = "rotateY(180deg)";
                    backs[nextPageNr].style.transform = "rotateY(0deg)";
                } else {
                    fronts[nextPageNr].style.transform = "rotateY(0deg)";
                    backs[nowPageNr].style.transform = "rotateY(180deg)";
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
                document.getElementById('my-jira-link-not-ready').style.display = 'none';
                document.getElementById('my-jira-link-ready').style.display = 'block';
            } else {
                throw Error('Api exception');
            }
        })
        .catch(function () {
            document.getElementById('my-jira-link-not-ready').style.display = 'flex';
            document.getElementById('my-jira-link-ready').style.display = 'none';
        })
}

const getRandomColor = function () {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const initMyJira = function () {
    fetchMyJiraStatus('https://my-jira.herokuapp.com/health/running', 10000, 10);
    changeLang("PL");
};

initMyJira();
onPageScroll();
