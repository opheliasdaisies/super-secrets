import React, {useState, useEffect} from 'react';
import './App.css';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

firebase.initializeApp({
});

let db = firebase.firestore();

function Secret({ secret, index, findSecret, removeSecret }) {
  return(
    <div
      className='secret'
      style={{ textDecoration: secret.isCompleted ? "line-through" : '' }}
    >
      {secret.text}
      <div>
        <button onClick={() => findSecret(index)}>Find</button>
        <button onClick={() => removeSecret(index)}>X</button>
      </div>
    </div>
  )
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

  useEffect(async () => {
    db.collection('test_secrets').get()
      .then((querySnapshot) => {
        let loadedSecrets = []
        querySnapshot.forEach((doc) => {
          loadedSecrets.push(doc.data())
        });
        setSecrets(loadedSecrets);
      })
  }, []);

  const addSecret = text => {
    const updatedSecrets = [...secrets, { text }]
    setSecrets(updatedSecrets);
  };

  const findSecret = index => {
    const newSecrets = [...secrets];
    newSecrets[index].isCompleted = true;
    setSecrets(newSecrets);
  }

  const removeSecret = index => {
    const newSecrets = [...secrets];
    newSecrets.splice(index, 1);
    setSecrets(newSecrets);
  }

  return (
    <div className='app'>
      <div className='secret-list'>
        {secrets.map((secret, index) => (
          <Secret
            key={index}
            index={index}
            secret={secret}
            findSecret={findSecret}
            removeSecret={removeSecret}
          />
        ))}
        <SecretForm addSecret={addSecret} />
      </div>
    </div>
  )
}

export default App;
