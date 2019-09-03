import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';

import File from '../models/File';
import Meetapp from '../models/Meetapps';

class MeetappController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const meetapps = await Meetapp.findAll({
      where: {
        user_id: req.userId,
      },
      order: ['date'],
      attributes: ['id', 'title', 'description', 'location', 'date'],
      include: [
        {
          model: File,
          as: 'file',
          attributes: ['name', 'path', 'url'],
        },
      ],
      limit: 10,
      offset: (page - 1) * 10,
    });

    return res.json(meetapps);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      file_id: Yup.number().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const meetapp = await Meetapp.create({
      user_id: req.userId,
      ...req.body,
    });

    return res.json(meetapp);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      file_id: Yup.number().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetapp = await Meetapp.findByPk(req.params.id);

    if (meetapp.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have parmission to update this meetapp",
      });
    }

    const hourStart = startOfHour(parseISO(req.body.date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({
        error: 'You can not edit past meetapps',
      });
    }

    if (!meetapp.editable) {
      return res.status(400).json({ error: "Can't update past meetups." });
    }

    await meetapp.update(req.body);

    return res.json(meetapp);
  }

  async delete(req, res) {
    const meetapp = await Meetapp.findByPk(req.params.id);

    if (meetapp.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have parmission to delete this meetapp",
      });
    }

    if (meetapp.past) {
      return res.status(400).json({ error: "Can't delete past meetups." });
    }

    await meetapp.destroy(req.body);

    return res.send();
  }
}

export default new MeetappController();
