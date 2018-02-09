'use strict';

module.exports = function(Chambre) {
 
  var app = require('../../server/server');
  var randomstring = require("randomstring");
  var _ = require("underscore");



 /**
 * l'ensemble des codifiants dans une chambre donnée
 * 
 */

  Chambre.prototype.codifiants = function(callback) {
    Chambre.prototype.reservations((err, reserv) => {
      if (err)
        callback(err);
      var locataires = [];
      reserv.forEach((r, index, array) => {
        Chambre.app.models.Account.findById(r.accountId, {include: 'etudiants'}, function(err, account) {
          locataires.push({
            reservation: {
              date: r.date,
              position: r.position,
              confirme: r.confirme,
            },
            etudiant: account.etudiants(),
          });
          if (index == array.length - 1)
            callback(null, locataires);
        });
      });
    });
  };


  /**
   * renvoie l'ensemble des positions dans une étage donnée
   * @param {string} etage L'etage dans lequel on recherche
   * @param {Function(Error, string)} callback
   */
  Chambre.prototype.positions = function(callback) {
      Chambre.findById(this.id, {"include":["reservations"]}, function (err, chambre) {
      var reservations = chambre.reservations();
      var positions = reservations.map(function (r) {return r.position});
      callback(null, positions);
    })
  };



   /**
   * reserver une position
   * @param {string} chambre Id de la position
   * @param {Function(Error, date)} callback
   */


  Chambre.prototype.reserver = function(accountId, callback) {
    var capacite = this.nbremaxoccupants;
    var id = this.id;
    Chambre.app.models.Account.findById(accountId, {include:'reservation'}, function (err, account) {
      var reservation = account.reservation();
      if(reservation){
        if(reservation.confirme){
          callback(null, {ok: false, erreur: 'Vous avez déjà codifié une chambre'});
        }else{
          callback(null, {ok: false, erreur: 'vous avez déjà réservé une chambre'});
        }
      }else{
        Chambre.prototype.__get__reservations("", function (err, reservations) {
          if(err)
            callback(err);
          else if(reservations.length < capacite){
            var today = Date.now();
            console.log(reservations);
            today = new Date(today);
            Chambre.app.models.Reservation.create({
              'datereserv': today,
              'confirmation': false,
              'position': reservations.length+1,
              'accountId': accountId,
              'chambreId':id
              
            }, function(err, reserv) {
              Chambre.app.models.CodeReservation.create({
                "codeReservation": randomstring.generate(7),
                "idReservation":reserv.id
              }, function (err, code) {
                var url_confirmer = 'http://localhost:8080/confirmer-reservation?code='+code.codeReservation;
                const mail = {
                  from: 'codificationcoudesp@gmail.com', // addresse source
                  to: account.email, // adresse destinataire
                  subject: 'Confirmation de votre réservation de chambre', // objet du mail
                  html: `<p>Reservation réussie</p>
                    <p>Votre code de confirmation est: <strong>${code.codeReservation}</strong></p>
                    <p>Vous pouvez confirmer en cliquant sur: <a href="${url_confirmer}">${url_confirmer}</a></p>
                    <p><strong>NB:</strong>Vous avez <strong>24h</strong> pour confirmer sinon votre reservation sera <strong>annulee automatiquement!</strong></p>`
                };
                Chambre.app.models.Email.send(mail, function (err, info) {
                  if(err) {
                    console.log(err);
                    callback(err);
                  }else{
                    var tomorow = new Date(today.getDate() + 1);
                    callback(null, {delai: tomorow, 'ok': true});
                  }
                });
              });
            });
          }else callback(null, {erreur: 'Desole la chambre est deja pleine','ok': false});
        });
      }
    })

  };

};
