function login() {
    return new Promise((resolve, reject) => {
        VK.init({
            apiId: 5909618
        });

        VK.Auth.login(result => {
            if (result.status == 'connected'){
                resolve();
            } else{
                reject();
            }
        });

    })
}

function callAPI(metod, param) {
    return new Promise((resolve, reject) => {
        VK.api(metod, param, result => {
            if(result.error){
                reject();
            } else{
                resolve(result.response);
            }
        })
    })
}

function newFriend(friend) {
    var template = `
         <img src="${friend.photo_100}" alt="">
         <h3>${friend.first_name} ${friend.last_name}</h3>
         <button><i class="fa fa-plus" aria-hidden="true"></i></button>`,
        liFriend = document.createElement('li');

    liFriend.innerHTML = template;
    liFriend.setAttribute("draggable","true");
    liFriend.className = "friendLi";

    return liFriend;
}

function findAncestor (el, atr, cls) {
    while ((el = el.parentElement) && (!(el.hasAttribute(atr)) || (el.className = cls)));
    return el;
}

function changeIcon (e){
    var target = e.target,
        el =  e.target.parentNode.parentNode;

    if(e.target.nodeName == 'I'){
        if (target.className == 'fa fa-plus') {
            target.className = 'fa fa-times';
            friend_sorted.appendChild(el);
        } else {
            target.className = 'fa fa-plus';
            friendsId.appendChild(el);
        }
    }
}

login()
    .then( () => { return callAPI('friends.get', { v: 5.62, fields:'city,photo_100'}); })
    .then( result => result.items.forEach(friend => {
        friendsId.appendChild(newFriend(friend));
    }))
    .then( () => {
        var target = document.querySelectorAll('[data-draggable="target"]');

        function handleDragStart(e) {
            if(e.target.nodeName == 'IMG'){
               e.preventDefault();
            }
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text', e.target.outerHTML);
        }

        var friendLi = document.querySelectorAll('.friendLi');


        function handleDragOver(e) {
            if (e.preventDefault) {
                e.preventDefault(); // Necessary. Allows us to drop.
            }
            e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

            return false;
        }


        function handleDrop(e) {
            e.preventDefault();
            var elGet = e.dataTransfer.getData('text'),
                targetEl = document.getElementById(e.target.id);
                div = document.createElement('div');

            if(!targetEl){
                targetEl = findAncestor (e.target, 'data-draggable');
                console.log(targetEl);
            }

            div.innerHTML = elGet;

            var elements = div.firstChild,
               i = elements.lastChild.firstChild;

            if (i.className == 'fa fa-plus') {
                i.className = 'fa fa-times';
            }else{
                i.className = 'fa fa-plus';
            }

            elements.addEventListener('dragstart', handleDragStart, false);
            elements.addEventListener('dragend', handleDragEnd, false);
            targetEl.appendChild(elements);

            return false;

        }

        function handleDragEnd(e) {
            e.target.remove();
        }

        [].forEach.call(friendLi, function(friendLi) {
            friendLi.addEventListener('dragstart', handleDragStart, false);
            friendLi.addEventListener('dragend', handleDragEnd, false);
        });

        [].forEach.call(target, function (target) {
            target.addEventListener('drag', e => {}, false);
            target.addEventListener('dragover', handleDragOver, false);
            target.addEventListener('drop', handleDrop, false);
        });

        var outer = friendsId.innerHTML;

        search_left.addEventListener('keyup', function () {
            var search = search_left.value.toLowerCase().trim(),
                items = document.querySelectorAll('.friendLi');

            if (search){
                items.forEach(function (items) {
                    if (items.childNodes[3].innerHTML.toLowerCase().indexOf(search) > -1) {
                        } else {
                        items.outerHTML = '';
                    }
                })
            }else { friendsId.innerHTML = outer; }
        })


    })
    .then(() =>  {

        var storage = localStorage;

        save.addEventListener('click', function() {
            storage.data = JSON.stringify({
                leftColumn: friendsId.innerHTML
            });
            alert('saved');
        });

        window.addEventListener('DOMContentLoaded', function() {
            var data = JSON.parse(storage.data || '{}');

            friendsId.innerHTML = data.leftColumn || '';
        });

        load.addEventListener('click', function() {
            var data = JSON.parse(storage.data || '{}');

            friendsId.innerHTML = data.leftColumn || '';
        });
    })

    .catch(function () {
        console.log('something gows wrong');
    })

friendsId.addEventListener('click', e => changeIcon(e));
friend_sorted.addEventListener('click', e => changeIcon(e));




