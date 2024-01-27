"use strict";
const Issue = require("../controllers/mongo.js").Issue;

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(async function (req, res) {
      let project = req.params.project;
      await Issue.find({ project: project, ...req.query })
        .select("-project")
        .exec()
        .then((data) => {
          if (data.length > 0) {
            res.send(data);
          } else {
            res.send("No issues for this project");
          }
        })
        .catch((err) => {
          if (err) {
            res.send("404 Not Found");
          }
        });
    })

    .post(async function (req, res) {
      let project = req.params.project;
      let issue = new Issue({ ...req.body, project: project });
      try {
        const savedIssue = await issue.save();
        const responce = await Issue.findById(savedIssue._id).select(
          "-project"
        );
        res.json(responce);
      } catch (err) {
        res.json({ error: "required field(s) missing" });
      }
    })

    .put(async function (req, res) {
      const id = req.body._id;
      if (!id) {
        return res.json({ error: "missing _id" });
      }

      const updateFields = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        open: req.body.open,
      };

      Object.keys(updateFields).forEach((key) => {
        if (updateFields[key] === undefined) {
          delete updateFields[key];
        }
      });

      if (Object.keys(updateFields).length === 0) {
        return res
          .json({ error: "no update field(s) sent", _id: id });
      }

      try {
        updateFields.updated_on = new Date();
        const updatedIssue = await Issue.findOneAndUpdate(
          { _id: id },
          updateFields,
          { new: true }
        );

        if (!updatedIssue) {
          return res.json({ error: "could not update", _id: id });
        }

        res.json({ result: "successfully updated", _id: id });
      } catch (err) {
        res.json({ error: "could not update", _id: id });
      }
    })

    .delete(function (req, res) {
      let id = req.body._id;
      if (!id) {
        res.json({ error: "missing _id" });
      } else {
        Issue.findByIdAndDelete(id)
          .then((deletedIssue) => {
            if (!deletedIssue) {
              res.json({ error: "could not delete", _id: id });
            } else {
              res.json({ result: "successfully deleted", _id: id });
            }
          })
          .catch((err) => {
            res.json({ error: "could not delete", _id: id });
          });
      }
    });
};
