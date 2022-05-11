const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'yoprqvukffdpgc',
  host: 'ec2-52-49-68-244.eu-west-1.compute.amazonaws.com',
  database: 'd2c64sn4997p2t',
  password: '94c327210501c5133472e8068e15cb80aa44ac40f9105b89761f00e18203e2a4',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});
module.exports = {

  RegisterUser: async function (login, pass) {
    var query = `select register_new_user(\'${login}\', \'${pass}\');`;  
    console.log(query);
    try {
      const res = await pool.query(
        query,
        []
      );
      console.log(res.rows[0].register_new_user);
      return res.rows[0].register_new_user;
    } catch (error) {
      console.error(error);
      return "RegisterUser: smth error";
    }
},

  LoginUser: async function (login, pass) {
      var query = `select loginuser(\'${login}\', \'${pass}\');`;  
      console.log(query);
      try {
        const res = await pool.query(
          query,
          []
        );
        console.log(res.rows[0].loginuser);
        return res.rows[0].loginuser;
      } catch (error) {
        console.error(error);
        return "LoginUser: smth error";
      }
  },

  GetRooms: async function (token) {
    var query = `select get_rooms(\'${token}\');`;  
    try {
      const res = await pool.query(
        query,
        []
      );
      const jres = JSON.stringify(res.rows[0]);
      console.log(jres);
      return jres;

    } catch (error) {
      console.error(error);
      return "GetRooms: smth error";
    }
  },

  CheckUserByLogin: async function (token, login) { 
    var query = `select check_user_by_login(\'${token}\', \'${login}\');`;
    console.log(query);
    try {
      const res = await pool.query(
        query,
        []
      );
      const jres = JSON.stringify(res.rows[0]);
      console.log(jres);
      return jres;

    } catch (error) {
      console.error(error);
      return "CheckUserByLogin: smth error";
    }
  },

  CreateRoom: async function (token, room_name, room_users) { 
    var query = `select create_room(\'${token}\', \'${room_name}\', \'${room_users}\');`;
    console.log(query);
    try {
      const res = await pool.query(
        query,
        []
      );
      const jres = JSON.stringify(res.rows[0]);
      console.log(jres);
      return jres;

    } catch (error) {
      console.error(error);
      return "CreateRoom: smth error";
    }
  },

  GetMessages: async function (token, room_id) {
    var query = `select get_room_messages(\'${token}\', ${room_id});`;  
    try {
      const res = await pool.query(
        query,
        []
      );
      const jres = JSON.stringify(res.rows[0]);
      console.log(jres);
      return jres;

    } catch (error) {
      console.error(error);
      return "GetRooms: smth error";
    }
  },

  SendMessage: async function (token, mtext, room_id) { 
    var query = `select send_mess(\'${token}\', \'${mtext}\', \'${room_id}\');`;
    console.log(query);
    try {
      const res = await pool.query(
        query,
        []
      );
      const jres = JSON.stringify(res.rows[0]);
      console.log(jres);
      return jres;

    } catch (error) {
      console.error(error);
      return "SendMessage: smth error";
    }
  },

};