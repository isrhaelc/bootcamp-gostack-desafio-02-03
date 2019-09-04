import { Model } from 'sequelize';

class Subscription extends Model {
  static init(sequelize) {
    super.init(
      {},
      {
        sequelize,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Meetapps, {
      foreignKey: 'meetapp_id',
    });
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  }
}

export default Subscription;
