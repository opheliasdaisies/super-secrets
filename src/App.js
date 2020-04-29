import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './App.css';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';

firebase.initializeApp({
  apiKey: 'AIzaSyAieFeZtBjHMCqzH4wDchXLwlWSW6RJpgI',
  authDomain: 'super-secrets-2323e.firebaseapp.com',
  databaseURL: 'https://super-secrets-2323e.firebaseio.com',
  projectId: 'super-secrets-2323e',
  storageBucket: 'super-secrets-2323e.appspot.com',
  messagingSenderId: '274541627291',
  appId: '1:274541627291:web:8632de9bbe67b2d0de833e'
});

let db = firebase.firestore();

function Secret({ secret, index, id, findSecret, removeSecret }) {
  let style = (
    <div
      className='secret'
      style={{ textDecoration: secret.isCompleted ? "line-through" : '' }}
    >
      {secret.text}
      <div>
        <Button variant='outline-secondary' size='sm' onClick={() => findSecret(index, id)}>Find</Button>
        <Button variant='outline-secondary' size='sm' onClick={() => removeSecret(index, id)}>X</Button>
      </div>
    </div>
  );
  return style;
}

function SecretForm({ addSecret }) {
  const [secretTitle, setSecretTitle] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!secretTitle) return;
    addSecret(secretTitle);
    setSecretTitle('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='text'
        className='input'
        value={secretTitle}
        onChange={e => setSecretTitle(e.target.value)}
      />
    </form>
  )
}

function App() {
  const [secrets, setSecrets] = useState([]);

  useEffect(() => {
    async function fetchData() {
      await db.collection('test_secrets').get()
        .then((querySnapshot) => {
          let loadedSecrets = []
          querySnapshot.forEach((doc) => {
            loadedSecrets.push({'id': doc.id, 'data': doc.data()});
          });
          setSecrets(loadedSecrets);
        })
    }
    fetchData();
  }, []);

  const addSecret = text => {
    db.collection('test_secrets').add({
      'text': text,
      'isCompleted': false
    })
    .then((docRef) => {
      console.log('Document successfully written');
      const updatedSecrets = [...secrets, { 'id': docRef.id, 'data':  {'text': text, 'isCompleted': false}}]
      setSecrets(updatedSecrets);
    })
    .catch((error) => {
      console.error('Error writing document: ', error);
    });
  };

  const findSecret = (index, id) => {
    db.collection('test_secrets').doc(id).set({
      'isCompleted': true
    }, { merge: true })
      .then(() => {
        console.log('Secret was found!')
        const newSecrets = [...secrets];
        newSecrets[index].isCompleted = true;
        setSecrets(newSecrets);
      })
      .catch((error) => {
        console.error('Secret was not marked as found: ', error);
      });
  }

  const removeSecret = (index, id) => {
    db.collection('test_secrets').doc(id).delete()
      .then(() => {
        console.log('Secret deleted!');
        const newSecrets = [...secrets];
        newSecrets.splice(index, 1);
        setSecrets(newSecrets);
      })
      .catch((error) => {
        console.error('Secret was not removed: ', error);
      });
  }
  return (
    <div className='app'>
      <div className='secret-list'>
        {secrets.map((secret, index) => (
          <Secret
            key={index}
            index={index}
            id={secret.id}
            secret={secret.data}
            findSecret={findSecret}
            removeSecret={removeSecret}
          />
        ))}
        <SecretForm addSecret={addSecret} />
      </div>
      <div className='new-secret-button'>
        <Button variant='dark'>Add A Secret</Button>
        <Button variant='light'>Uncover A Secret</Button>
      </div>
    </div>
  )
}

export default App;
