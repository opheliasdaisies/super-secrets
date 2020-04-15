import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';

const Secret = ({ secret }) => <div className='secret'>{secret.text}</div>

function SecretForm({ addSecret }) {
  const [secretTitle, setSecretTitle] = useState('');

  const handleSubmit = e => {
    e.preventDEfault();
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
  const [secrets, setSecrets] = useState([
    {text: 'Learn about React'},
    {text: 'meet friend for lunch'},
    {text: 'build really cool app'}
  ]);

  const addSecret = newSecret => {
    const updatedSecrets = [...secrets, { newSecret }]
    setSecrets(updatedSecrets);
  };

  return (
    <div className='app'>
      <div className='secret-list'>
        {secrets.map((secret, index) => (
          <Secret
            key={index}
            index={index}
            secret={secret}
          />
        ))}
        <SecretForm addSecret={addSecret} />
      </div>
    </div>
  )
}

export default App;
