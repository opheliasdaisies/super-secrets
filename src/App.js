import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import './App.css';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from 'moment';

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
  let date = moment(parseInt(secret.firstFoundAt)).format('dddd, MMMM Do YYYY')
  let time = moment(parseInt(secret.firstFoundAt)).format('h:mm a')

  return (
    <Card>
      <Card.Header>
        <Card.Title className='text-center'>{secret.title}</Card.Title>
      </Card.Header>
      <Card.Body>
        <Card.Subtitle>This secret was discovered:</Card.Subtitle>
        <Card.Text>{secret.content}</Card.Text>
        <Card.Subtitle>This is the rest of the story:</Card.Subtitle>
        <Card.Text>{secret.story}</Card.Text>
      </Card.Body>
      <Card.Footer>
        First found {date} at {time}
      </Card.Footer>
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
      aria-labelledby='find-secret-modal-title'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id='find-secret-modal-title'>
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

function FoundSecretContentModal(props) {
  return(
    <Modal
      {...props}
      size='lg'
      aria-labelledby='found-secret-content-modal-title'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id='found-secret-content-modal-title'>
          Congratulations! You found the secret: {props.secretTitle}
        </Modal.Title>
      </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey='story' id='found-secret-modal-tabs'>
            <Tab eventKey='content' title="Secret Content">
              <p>{props.secretContent}</p>
            </Tab>
            <Tab eventKey='story' title="Secret Story">
              <p>{props.secretStory}</p>
            </Tab>
          </Tabs>
        </Modal.Body>
    </Modal>
  )
}

function App() {
  const [foundSecrets, setFoundSecrets] = useState([]);
  const [addModalShow, setAddModalShow] = useState(false);
  const [findModalShow, setFindModalShow] = useState(false);
  const [currentFoundSecret, setCurrentFoundSecret] = useState({});
  const [foundSecretContentModalShow, setFoundSecretContentModalShow] = useState(false);
  // TODO: Add notes for secrets, by finder
  // TODO: Make sure background extends/repeats

  useEffect(() => {
    async function fetchData() {
      await db.collection('test_secrets')
        .orderBy('firstFoundAt', 'desc')
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
    // TODO: Add confirmation when secret is added along with secret code
    // TODO: make the secret codes friendlier
    // TODO: Add ability to edit or delete your own secret
    db.collection('test_secrets').add({
      'title': title,
      'content': content,
      'story': story,
      'isFound': false,
      'createdAt': moment().format('x'),
      'firstFoundAt': null
    })
    .then((docRef) => {
      console.log('Document successfully written');
      setAddModalShow(false)
    })
    .catch((error) => {
      console.error('Error writing document: ', error);
    });
  };

  const secretNotYetFound = (foundSecretId) => {
    for (let i in foundSecrets){
      if (foundSecrets[i]['id'] === foundSecretId) {
        return false;
      }
    }
    return true;
  }

  const findSecret = (id) => {
    db.collection('test_secrets').doc(id).get()
      .then((querySnapshot) => {
        if (querySnapshot.data()){
          let foundSecret = {'id': id, 'data': querySnapshot.data()};
          let foundDate = foundSecret.data.firstFoundAt || moment().format('x');
          foundSecret['data']['isFound'] = true
          foundSecret['data']['firstFoundAt'] = foundDate
          db.collection('test_secrets').doc(id).set(foundSecret['data'])
            .then(() => {
              setCurrentFoundSecret(foundSecret.data)
              setFindModalShow(false)
              setFoundSecretContentModalShow(true)
              const newSecrets = [...foundSecrets];
              if (secretNotYetFound(foundSecret.id)) {
                newSecrets.unshift(foundSecret);
                setFoundSecrets(newSecrets);
              }
            })
            .catch((error) => {
              console.error('Secret was not marked as found: ', error);
            });
        } else {
          console.log('no secret!')
          // TODO: Tell user if secret doesn't exist
        }
      })
      .catch((error) => {
        console.error('Error retrieving secret: ', error);
      })
  }

  return (
    <div className='app'>
      <Container >
        <Row className='title'>
          <h1>Super Secrets</h1>
        </Row>
        <Row className='about'>
          <h2>What is this anyway?</h2>
          <p>
            This project is inspired by secrets and collectables in video games.<br/>
            Have you found a secret? Click "Uncover the story" and find out what other information you will
            uncover!<br/>
            Do you want to share a story? Click "Add a secret". Write the secret content on a piece of paper and
            leave it somewhere in your neighborhood for someone to find. Make sure to write the code on it and supersecrets.club
            so that whoever finds the secret can learn the rest of the story.<br/>
            Once a secret is found, it will be visible for everyone to see.
          </p>
          <Button variant='outline-light' onClick={() => setAddModalShow(true)}>Add A Secret</Button>
          <Button variant='light' onClick={() => setFindModalShow(true)}>Uncover The Story Behind A Secret</Button>
        </Row>
        <CardDeck className='secret-list'>
          {foundSecrets.map((secret, index) => (
            <Secret
            key={index}
            index={index}
            id={secret.id}
            secret={secret.data}
            foundAt={secret.firstFoundAt}
            />
            ))}
        </CardDeck>
        <AddSecretModal
          show={addModalShow}
          onHide={() => setAddModalShow(false)}
          addSecret={addSecret}
        />
        <FindSecretModal
          show={findModalShow}
          onHide={() => setFindModalShow(false)}
          findSecret={findSecret}
        />
        <FoundSecretContentModal
          show={foundSecretContentModalShow}
          secretTitle={currentFoundSecret.title}
          secretContent={currentFoundSecret.content}
          secretStory={currentFoundSecret.story}
          onHide={() => {
            setFoundSecretContentModalShow(false);
            setCurrentFoundSecret({});
          }}
        />
      </Container>
    </div>
  )
}

export default App;
