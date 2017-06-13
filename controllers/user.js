'use strict';

var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');

var User = require('../models/user');
var jwt = require('../services/jwt');


function pruebas(req, res){
    res.status(200).send({
      message: 'Probando una accion del controlador de usuarios'
    });
};


function saveUser(req, res){
    var user = new User();
    var params = req.body;

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_USER';
    user.image = 'null';

    if(params.password){
        bcrypt.hash(params.password, null, null, function(err, hash){
          user.password = hash;

          if(user.name != null && user.surname != null && user.email != null){
              //Guarda usuario.

              user.save(function(err, userStored){
                  if(err){
                      res.status(500).send({message: 'Error al guardar usuario.'});
                  }else{
                      if(!userStored){
                          res.status(404).send({message: 'No se ha registrado el usuario.'})
                      }else{
                          res.status(200).send({user: userStored});
                      }
                  }
              });
          }else{
            //Verificar campos incompletos.
              res.status(200).send({ message: 'Verique los datos ingresados.'});
          }
        });
    }else{
      res.status(500).send({message: 'Introducir contraseña.'});
    }
};


function loginUser(req, res){
      var params = req.body;

      var email = params.email;
      var password = params.password;

        User.findOne({email: email.toLowerCase()}, (err, user) =>{
          if(err){
            res.status(500).send({message: 'Error en la peticion.'});
          }else{
            if(!user){
              res.status(404).send({message: 'El usuario no existe.'});
            }else{
              //Comprobar contraseña.
              bcrypt.compare(password, user.password, function(err, check){
                  if(check){
                    //Devolver datos del usuario logueado.
                    if(params.gethash){
                      //Devolver un token de jwt.
                       res.status(200).send({
                           token: jwt.createToken(user)
                         });
                    }else{
                      res.status(200).send({user});
                    }
                  }else{
                    res.status(404).send({message: 'Error al loguearse.'});
                  }
              })
            }
          }
      });
};


function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
      if(err){
        res.status(500).send({message: 'Error al actualizar el usuario.'});
      }else{
        if(!userUpdated){
            res.status(404).send({message: 'No se ha podido actualizar el usuario.'});
        }else{
            res.status(200).send({user: userUpdated});
        }
      }
    });
};


function uploadImage(req, res){
    var userId = req.params.id;
    var file_name = 'No se cargo la imagen...';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];

        console.log('file path', file_path);
        console.log("file_split", file_split);
        console.log("file_name",file_name);

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
            User.findByIdAndUpdate(userId, {image: file_name}, (err, userUpdated)=>{
              if(!userUpdated){
                  res.status(404).send({message: 'No se ha podido actualizar el usuario.'});
              }else{
                  res.status(200).send({user: userUpdated});
              }
            });
        }else{
            res.status(200).send({message: ' La extension del archivo no es valida.'})
        }
    }else{
        res.status(200).send({message: ' No has subido ninguna imagen...'})
    }
};


function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var path_file = './uploads/users/' + imageFile;
    fs.exists(path_file, function(exists) {
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message: 'No existe la imagen...'})
        }
    });
};


module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile

};
