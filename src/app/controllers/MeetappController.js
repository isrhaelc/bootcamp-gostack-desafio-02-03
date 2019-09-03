import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';

import User from '../models/User';
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
      limit: 10,
      offset: (page - 1) * 10,
    });

    return res.json(meetapps);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title, description, location, date } = req.body;

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const meetapp = await Meetapp.create({
      user_id: req.userId,
      title,
      description,
      location,
      date,
    });

    return res.json(meetapp);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
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

    const { title, date } = await meetapp.update(req.body);

    return res.json({ title, date });
  }

  async delete(req, res) {
    const meetapp = await Meetapp.findByPk(req.params.id);

    if (meetapp.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have parmission to delete this meetapp",
      });
    }

    const hourStart = startOfHour(parseISO(req.body.date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({
        error: 'You can not delete past meetapps',
      });
    }

    const { title, date } = meetapp;

    await meetapp.destroy(req.body);

    return res.json({ title, date });
  }
}

export default new MeetappController();
