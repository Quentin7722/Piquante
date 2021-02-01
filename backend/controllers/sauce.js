const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.likeSauce = (req, res, next) => {

  Sauce.findOne({
    _id: req.params.id
  })
    .then(sauce => {

      if (req.body.like == -1) {
        sauce.dislikes = sauce.dislikes + 1;
        sauce.usersDisliked.push(req.body.userId);
        sauceObject = {
          "dislikes": sauce.dislikes,
          "usersDisliked": sauce.usersDisliked
        }
      } else if (req.body.like == 0) {

        if (sauce.usersDisliked.find(user => user === req.body.userId)) {
          sauce.usersDisliked = sauce.usersDisliked.filter(user => user !== req.body.userId);
          sauce.dislikes = sauce.dislikes - 1;
          sauceObject = {
            "dislikes": sauce.dislikes,
            "usersDisliked": sauce.usersDisliked
          }
        } else {
          sauce.usersLiked = sauce.usersLiked.filter(user => user !== req.body.userId);
          sauce.likes = sauce.likes - 1;
          sauceObject = {
            "likes": sauce.likes,
            "usersLiked": sauce.usersLiked
          }
        }
      } else if (req.body.like == 1) {
        sauce.likes = sauce.likes + 1;
        sauce.usersLiked.push(req.body.userId);
        sauceObject = {
          "likes": sauce.likes,
          "usersLiked": sauce.usersLiked
        }
      } else {
        return res.status(500).json({
          error: 'Bad request'
        })

      };

      Sauce.updateOne({
        _id: req.params.id
      }, {
        $set: sauceObject
      })
        .then(() => res.status(200).json({
          message: 'Updated notice'
        }))
        .catch(error => res.status(400).json({
          error
        }));
    })
    .catch(() => res.status(400).json({
      error: 'Sauce not found'
    }));
};


