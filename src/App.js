import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
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

function Secret({ secret, index, id }) {
  return (
    <Card style={{ 'min-width': '25%' }}>
      <Card.Header>
        <Card.Title className='text-center'>{secret.title}</Card.Title>
      </Card.Header>
      <Card.Body>
        <Card.Subtitle>This secret was discovered:</Card.Subtitle>
        <Card.Text>{secret.content}</Card.Text>
        <Card.Subtitle>This is the rest of the story:</Card.Subtitle>
        <Card.Text>{secret.story}</Card.Text>
      </Card.Body>
    </Card>
  );
}

function SecretForm({ addSecret }) {
  const [secretTitle, setSecretTitle] = useState('');
  const [secretContent, setSecretContent] = useState('');
  const [secretStory, setSecretStory] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!secretTitle) return;
    if (!secretContent) return;
    if (!secretStory) return;
    addSecret(secretTitle, secretContent, secretStory);
    setSecretTitle('');
    setSecretContent('');
    setSecretStory('');
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId='formSecretTitle'>
        <Form.Label>Write a Title</Form.Label>
        <Form.Control
          type='text'
          placeholder='Enter a title'
          value={secretTitle}
          onChange={e => setSecretTitle(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId='formSecretContent'>
        <Form.Label>Enter the Secret Content</Form.Label>
        <Form.Control
          as='textarea'
          rows='5'
          placeholder='Enter the content of the secret. This will be whatever is found "in the wild", whether it be a note, a recording, or something else.'
          onChange={e => setSecretContent(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId='formSecretStory'>
        <Form.Label>Write a Secret Story</Form.Label>
        <Form.Control
          as='textarea'
          rows='5'
          placeholder='Enter the rest of the story that was not included in the inital secret. This is the payoff the finder gets for registering that they found the secret!'
          onChange={e => setSecretStory(e.target.value)}
        />
      </Form.Group>
      <Button variant='primary' type='submit'>
        Submit
      </Button>
    </Form>
  )
}

function UncoverSecretForm({ findSecret }) {
  // TODO: On submit, show the secret story!
  const [secretId, setSecretId] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!secretId) return;
    findSecret(secretId);
    setSecretId('');
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId='formFindSecretID'>
        <Form.Label>Enter the Secret Code You Found</Form.Label>
        <Form.Control
          type='text'
          placeholder='Enter the Secret Code'
          value={secretId}
          onChange={e => setSecretId(e.target.value)}
        />
      </Form.Group>
      <Button variant='primary' type='submit'>
        Submit
      </Button>
    </Form>
  )
}

function AddSecretModal(props) {
  return(
    <Modal
      {...props}
      size='lg'
      aria-labelledby='add-secret-modal-title'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id='add-secret-modal-title'>
          Add New Secret
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Add your secret here</h4>
        <SecretForm addSecret={props.addSecret} />
      </Modal.Body>
    </Modal>
  );
}

function FindSecretModal(props) {
  return(
    <Modal
      {...props}
      size='lg'
      aria-labelledby='add-secret-modal-title'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id='add-secret-modal-title'>
          Uncover Secret
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Enter the id of the secret you found!</h4>
        <UncoverSecretForm findSecret={props.findSecret} />
      </Modal.Body>
    </Modal>
  );
}

function App() {
  const [foundSecrets, setFoundSecrets] = useState([]);
  const [addModalShow, setAddModalShow] = useState(false);
  const [findModalShow, setFindModalShow] = useState(false);
  // TODO: Add locations for secrets
  // TODO: Add notes for secrets, by finder

  useEffect(() => {
    async function fetchData() {
      await db.collection('test_secrets')
        .where('isFound', '==', true)
        .get()
        .then((querySnapshot) => {
          let loadedSecrets = []
          querySnapshot.forEach((doc) => {
            loadedSecrets.push({'id': doc.id, 'data': doc.data()});
          });
          setFoundSecrets(loadedSecrets);
        })
    }
    fetchData();
  }, []);

  const addSecret = (title, content, story)  => {
    // TODO: Add confirmation when secret is added
    // TODO: Add ability to edit or delete your own secret
    db.collection('test_secrets').add({
      'title': title,
      'content': content,
      'story': story,
      'isFound': false
    })
    .then((docRef) => {
      console.log('Document successfully written');
      setAddModalShow(false)
      const updatedSecrets = [...foundSecrets, {
        'id': docRef.id,
        'data':
          {
            'title': title,
            'content': content,
            'story': story,
            'isFound': false
          }
        }
      ];
      setFoundSecrets(updatedSecrets);
    })
    .catch((error) => {
      console.error('Error writing document: ', error);
    });
  };

  const findSecret = (id) => {
    // TODO: Add date found
    // TODO: Add modal showing found secret text, to highlight the story
    // TODO: First check to see if secret exists! Don't add if it does not
    db.collection('test_secrets').doc(id).set({
      'isFound': true
    }, { merge: true })
      .then(() => {
        console.log('Secret was found!')
        setFindModalShow(false) // TODO: instead of settng show to false, change body to show secret
        db.collection('test_secrets').doc(id).get()
          .then((querySnapshot) => {
            let foundSecret = {'id': id, 'data': querySnapshot.data()};
            const newSecrets = [...foundSecrets];
            // TODO: Only add new secret if it hasn't been found before
            newSecrets.unshift(foundSecret);
            setFoundSecrets(newSecrets);
          });
      })
      .catch((error) => {
        console.error('Secret was not marked as found: ', error);
      });
  }

  return (
    <div className='app'>

      <div className='new-secret-button'>
        <h1 style={{'color': 'white'}}>Super Secrets</h1>
        <Button variant='dark' onClick={() => setAddModalShow(true)}>Add A Secret</Button>
        <AddSecretModal
          show={addModalShow}
          onHide={() => setAddModalShow(false)}
          addSecret={addSecret}
        />
        <Button variant='light' onClick={() => setFindModalShow(true)}>Uncover The Story Behind A Secret</Button>
        <FindSecretModal
          show={findModalShow}
          onHide={() => setFindModalShow(false)}
          findSecret={findSecret}
        />
      </div>
      <CardDeck className='secret-list'>
        {foundSecrets.map((secret, index) => (
          <Secret
            key={index}
            index={index}
            id={secret.id}
            secret={secret.data}
          />
        ))}
      </CardDeck>
    </div>
  )
}

export default App;
