export class Api {
    constructor(options) {
        this._baseUrl = options.baseUrl;
        this._headers = options.headers;
    }

    _checkStatus(res) {
        if (res.ok) {
            return res.json()
        }
        return Promise.reject(`Что-то пошло не так: ${res.status}`);
    }

    getInitialCards() {
        return fetch(`${this._baseUrl}/cards`, {
            headers: this._headers
        })
            .then((this._checkStatus));
    }

    getUserData() {
        return fetch(`${this._baseUrl}/users/me`, {
            headers: this._headers,

        })
            .then(this._checkStatus);
    }

    postNewCard(data) {
        return fetch(`${this._baseUrl}/cards`, {
            headers: this._headers,
            method: 'POST',
            body: JSON.stringify({
                name: data.name,
                link: data.link
            })
        })
            .then(this._checkStatus);
    }

    setUserData(data) {
        return fetch(`${this._baseUrl}/users/me`, {
            headers: this._headers,
            method: 'PATCH',
            body: JSON.stringify({
                name: data.name,
                about: data.about
            })
        })
            .then(this._checkStatus);
    }

    setUserAvatarData(data) {
        return fetch(`${this._baseUrl}/users/me/avatar`, {
            headers: this._headers,
            method: 'PATCH',
            body: JSON.stringify({
                avatar: data.link
            })
        })
            .then(this._checkStatus);
    }

    deleteCard(cardId) {
        return fetch(`${this._baseUrl}/cards/${cardId}`, {
            headers: this._headers,
            method: 'DELETE'
        })
            .then(this._checkStatus);
    }

    changeLikeStatus(cardId, like) {
        return fetch(`${this._baseUrl}/cards/likes/${cardId}`, {
            method: like ? 'PUT' : 'DELETE',
            headers: this._headers
        })
            .then(this._checkStatus);
    }
}

export const api = new Api({
    baseUrl: 'https://mesto.nomoreparties.co/v1/cohort-14',
    headers: {
        authorization: '4905795f-d4f5-4259-8ab1-1154380da5eb',
        'Content-Type': 'application/json'
    }
}); 


