console.log("start server...");

const http = require("http");
const express = require( "express");
const WebSocket = require( "ws");
const dba = require('./db_adapterPG.js');

const app = express();
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
const clients = new Map();

const parseJsonAsync = (jsonString) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(JSON.parse(jsonString))
      })
    })
  }

webSocketServer.on('connection', ws => {
  ws.on('message', mess => {
    console.log(mess.toString());
    parseJsonAsync(mess).then(jsonMess => {
      switch (jsonMess.event) {

        case 'register_new_user':
          dba.RegisterUser(jsonMess.login, jsonMess.pass).then(answer => {
            console.log(`ws register_new_user answer: ${answer}`);  
            var onRegisterUserAnswerObject = {
              action_type: 'registerAnswer',
              result: answer
            } 
            onRegisterUserAnswer = JSON.stringify(onRegisterUserAnswerObject);
            console.log('onRegisterUserAnswer: ' + onRegisterUserAnswer);
            ws.send(onRegisterUserAnswer);
          }).catch( erro => {
            console.log('register_new_user_error: ' + erro);
          });
          break;
        
        case 'hello':
          clients.get(ws).token = jsonMess.token;
          break;        

        case 'login_user':
          dba.LoginUser(jsonMess.login, jsonMess.pass).then(answer => {
            console.log(`ws login_user answer: ${answer}`);  

            var onLoginAnswerObject = {
              action_type: 'loginAnswer',
              result: answer
            } 
            onLoginAnswer = JSON.stringify(onLoginAnswerObject);
            console.log('onloginAnswer: ' + onLoginAnswer);
            ws.send(onLoginAnswer);
          }).catch( erro => {
            console.log('login_user_error: ' + erro);
          });
          break;

        case 'get_rooms': 

          clients.forEach((client) => {
            console.log('cli.id: ' + client.id + ' cli.token ' + client.token);
          });

          dba.GetRooms(jsonMess.token).then(answer => {
            console.log(`ws get_rooms answer: ${answer}`);  

            var onRoomsAnswerObject = {
              action_type: 'roomsAnswer',
              result: answer
            } 
            onRoomsAnswer = JSON.stringify(onRoomsAnswerObject);
            console.log('onRoomsAnswer: ' + onRoomsAnswer);
            ws.send(onRoomsAnswer);
          }).catch( erro => {
            console.log('get_rooms_error: ' + erro);
          });
          break;

        case 'check_user_by_login':
          dba.CheckUserByLogin(jsonMess.token, jsonMess.login).then(answer => {
            console.log(`ws check_user_by_login answer: ${answer}`);  

            var onCheckUserAnswerObject = {
              action_type: 'checkUserAnswer',
              result: answer
            } 
            onCheckUserAnswer = JSON.stringify(onCheckUserAnswerObject);
            console.log('onCheckUserAnswer: ' + onCheckUserAnswer);
            ws.send(onCheckUserAnswer);
          }).catch( erro => {
            console.log('check_user_by_login_error: ' + erro);
          });
          break;

        case 'create_room':
          dba.CreateRoom(jsonMess.token, jsonMess.room_name, jsonMess.room_users).then(answer => {
            console.log(`ws create_room answer: ${answer}`);  

            var onCreateRoomAnswerObject = {
              action_type: 'CreateRoomAnswer',
              result: answer
            } 
            onCreateRoomAnswer = JSON.stringify(onCreateRoomAnswerObject);
            console.log('onCreateRoomAnswer: ' + onCreateRoomAnswer);
            ws.send(onCreateRoomAnswer);
          }).catch( erro => {
            console.log('create_room_error: ' + erro);
          });
          break;  

        case 'get_messages': 
        dba.GetMessages(jsonMess.token, jsonMess.room_id).then(answer => {
          console.log(`ws get_messages answer: ${answer}`);  

          var onMessagesAnswerObject = {
            action_type: 'messagesAnswer',
            result: answer
          } 
          onMessagesAnswer = JSON.stringify(onMessagesAnswerObject);
          console.log('onMessagesAnswer: ' + onMessagesAnswer);
          ws.send(onMessagesAnswer);
        }).catch( erro => {
          console.log('get_messages_error: ' + erro);
        });
        break;

        case 'send_message':
          dba.SendMessage(jsonMess.token, jsonMess.mtext, jsonMess.room_id).then(answer => {
            console.log(`ws send_message answer: ${answer}`);  

            var recipientsObj = JSON.parse(answer);
            var recipients = JSON.parse(recipientsObj.send_mess);
            console.log('-------------------------recipients: ');

            recipients.forEach(recipient => {
              for (let [_ws, value] of clients.entries()) {
                if (value.token === recipient.token)
                  // console.log(key);
                  // console.log(value.token);
                  var onNewMessageObject = {
                    action_type: 'NewMessage',
                    result: {
                      room_id: jsonMess.room_id,
                      token: jsonMess.token, 
                      mtext: jsonMess.mtext
                    }
                  } 
                  onNewMessage = JSON.stringify(onNewMessageObject);
                  // console.log('onSendMessageAnswer: ' + onSendMessageAnswer);
                  _ws.send(onNewMessage);
              }
              // console.log(recipient.token);
            });

            var onSendMessageAnswerObject = {
              action_type: 'SendMessageAnswer',
              result: answer
            } 
            onSendMessageAnswer = JSON.stringify(onSendMessageAnswerObject);
            // console.log('onSendMessageAnswer: ' + onSendMessageAnswer);
            ws.send(onSendMessageAnswer);
          }).catch( erro => {
            console.log('send_message_error: ' + erro);
          });
          break; 

        default:
          break;
      }
    });
  });

  ws.on("close", () => {
      console.log('disconnected id: ' + clients.get(ws).id);
      clients.delete(ws);
  });

  ws.on("error", e =>  {
    ws.send(e)
  });
  

  //  on connect
  const id = uuidv4();
  const token = null;
  const metadata = { id, token };
  clients.set(ws, metadata);


  // const myMap = new Map();
  // myMap.set("first_param", "first_value");

  var onConnectAnswerObject = {
    action_type: 'onConnect',
    result: id.toString()
  } 

  onConnectAnswer = JSON.stringify(onConnectAnswerObject);
  console.log(onConnectAnswer);
  ws.send(onConnectAnswer);

  console.log('------------------------');
  clients.forEach(client => console.log(client.id + ' ' + client.token));
  console.log('------------------------');

});

const PORT = process.env.PORT || 9091 

server.listen(PORT, () => console.log("Server started"))
