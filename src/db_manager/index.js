const { Model, DataTypes, Sequelize } = require('sequelize');
const { users_data } = require

const sequelize = new Sequelize('webservice', 'root', '1234', {
  host: 'localhost',
  dialect: 'mysql'
});

class User extends Model {}

User.init({
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        pwd: {
            type: DataTypes.STRING,
            allowNull: false
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
    sequelize, //우리가 사전에 DB접속을 위해 정의한 seqeulize 인스턴스
    modelName: 'User'
});

(async()=>{
    try {
        await sequelize.authenticate();
        console.log('DB연결 성공');
        await sequelize.sync({ force: true });

        users_data.forEach(async (user) => {
            await User.create(user);
        });
    } catch (error) {
        console.error('DB연결 실패', error);
    }
    // await sequelize.close();
    console.log('DB연결 종료');
})();