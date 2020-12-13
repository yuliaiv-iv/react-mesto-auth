import React, { useEffect, useState } from 'react';
import { Route, Switch, Redirect, useHistory } from 'react-router-dom';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import ImagePopup from './ImagePopup';
import { api } from '../utils/api';
import * as auth from '../utils/auth';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import ConfirmPopup from './ConfirmPopup';
import Register from './Register';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import InfoTooltip from './InfoTooltip';

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [isMessagePopupOpen, setMessagePopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(undefined);
  const [isloading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [message, setMessage] = useState('');

  const history = useHistory();

  useEffect(() => {
    Promise.all([api.getUserData(), api.getInitialCards()])
      .then(([info, card]) => {
        setCurrentUser(info);
        setCards(card);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [])

  function handleCardLike(card) {
    const isLiked = card.likes.some(like => like._id === currentUser._id);
    api.changeLikeStatus(card._id, !isLiked)
      .then((newCard) => {
        const newCards = cards.map((c) => c._id === card._id ? newCard : c);
        setCards(newCards);
      })
      .catch(err => {
        console.log(err);
      })
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id)
      .then(() => {
        const newCards = cards.filter((c) => c._id !== card._id);
        setCards(newCards);
        closeAllPopups()
      })
      .catch(err => {
        console.log(err);
      })
  }

  function handleDeleteClick(card) {
    setSelectedCard(card)
    setDeletePopupOpen(true);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
    setIsImagePopupOpen(true);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsImagePopupOpen(false);
    setDeletePopupOpen(false);
    setMessagePopupOpen(false);
    setSelectedCard();
  }

  function handleUpdateUser(data) {
    setIsLoading(true)
    api.setUserData(data)
      .then((result) => {
        setCurrentUser(result);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleUpdateAvatar(data) {
    setIsLoading(true)
    api.setUserAvatarData(data)
      .then(result => {
        setCurrentUser(result);
        closeAllPopups();
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleAddPlaceSubmit(card) {
    setIsLoading(true)
    api.postNewCard(card)
      .then(result => {
        setCards([result, ...cards]);
        closeAllPopups();
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleRegisterSubmit(email, password) {
    auth.register(email, password)
      .then((data) => {
        if (data) {
          history.push('/sign-in');
          setMessagePopupOpen(true);
          setIsSuccessful(true);
          setMessage('Вы успешно зарегистрировались!');
        }
      })
      .catch((err) => {
        setMessage('Что-то пошло не так! Попробуйте ещё раз');
        setMessagePopupOpen(true);
        setIsSuccessful(false);
        if (err === 400) {
          return console.log('некорректно заполнено одно из полей');
        }
      })
  }

  function handleLoginSubmit(email, password) {
    auth.authorize(email, password)
      .then((data) => {
        if (data.token) {
          setEmail(email)
          setLoggedIn(true);
          localStorage.setItem('token', data.token)
          history.push('/')
        }
      })
      .catch((err) => {
        setMessage('Что-то пошло не так! Попробуйте ещё раз');
        setMessagePopupOpen(true);
        setIsSuccessful(false);
        if (err === 400) {
          return console.log('не передано одно из полей');
        }
        if (err === 401) {
          return console.log('пользователь с email не найден');
        }
      })
  }

  function tokenCheck() {
    const token = localStorage.getItem('token');
    if (token) {
      auth.checkToken(token)
        .then((data) => {
          setEmail(data.data.email)
          setLoggedIn(true)
          history.push('/')
        })
        .catch((err) => {
          if (err === 401) {
            return console.log('Токен не передан или передан не в том формате');
          }
        })
    }
  }

  function onSignOut() {
    localStorage.removeItem('token');
    setLoggedIn(false)
    history.push('/sign-in')
  }

  useEffect(() => {
    tokenCheck();
  }, []);

  return (
    <div className="page">
      <CurrentUserContext.Provider value={currentUser}>
        <div className="container">
          <Header
            email={email}
            onClick={onSignOut}
            loggedIn={loggedIn}
          />
          <Switch>
            <ProtectedRoute exact path='/' loggedIn={loggedIn}>
              <Main
                cards={cards}
                onEditProfile={handleEditProfileClick}
                onAddPlace={handleAddPlaceClick}
                onEditAvatar={handleEditAvatarClick}
                onCardClick={handleCardClick}
                onCardLike={handleCardLike}
                onCardDelete={handleDeleteClick}
              />
              <Footer />
            </ProtectedRoute>
            <Route path="/sign-up">
              <Register
                onRegister={handleRegisterSubmit}
              />
            </Route>
            <Route path="/sign-in">
              <Login
                onLoggin={handleLoginSubmit}
              />
            </Route>
            <Route>
              {loggedIn ? <Redirect to="/" /> : <Redirect to="/sign-in" />}
            </Route>
          </Switch>
        </div>
        <InfoTooltip
          isOpen={isMessagePopupOpen}
          isSuccess={isSuccessful}
          message={message}
          onClose={closeAllPopups}
        />
        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClick={isloading}
          onClose={closeAllPopups}
          onUpdateUser={handleUpdateUser}
        />
        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClick={isloading}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
        />
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClick={isloading}
          onClose={closeAllPopups}
          onAddPlace={handleAddPlaceSubmit}
        />
        <ImagePopup
          isOpen={isImagePopupOpen}
          card={selectedCard}
          onClose={closeAllPopups}
        />
        <ConfirmPopup
          isOpen={isDeletePopupOpen}
          onClose={closeAllPopups}
          onDelete={handleCardDelete}
          card={selectedCard}
        />
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;


