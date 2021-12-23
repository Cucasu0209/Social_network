const userStatusEnum = require('../../app/enums/userStatus');
const bcrypt = require('bcryptjs');

const password = bcrypt.hashSync('123456');

exports.seed = async(knex) => {
    await knex('users').insert([{
        email: 'user1@gmail.com',
        mssv: 20183616,
        full_name: 'bot 1',
        gender: 1,
        birthday: '2000/03/02',
        province: 'Thành phố  Hà Nội',
        district: 'Đông Anh',
        status: userStatusEnum.ACTIVE,

        avatar_name: '',
        slogan: 'Trói em bằng cà vạt',
        location: '....',
        password
    }, {
        email: 'user2@gmail.com',
        mssv: 20183617,
        full_name: 'bot 2',
        gender: 1,
        birthday: '2000/03/02',
        province: 'Thành phố  Hà Nội',
        district: 'Đông Anh',
        status: userStatusEnum.ACTIVE,

        avatar_name: '',
        slogan: 'Trói em bằng cà vạt',
        location: '....',
        password
    }, {
        email: 'user3@gmail.com',
        full_name: 'bot 3',
        mssv: 20183618,
        gender: 1,
        birthday: '2000/03/02',
        province: 'Thành phố  Hà Nội',
        district: 'Đông Anh',
        status: userStatusEnum.ACTIVE,

        avatar_name: '',
        slogan: 'Trói em bằng cà vạt',
        location: '....',
        password
    }, {
        email: 'user4@gmail.com',
        full_name: 'bot 4',
        gender: 1,
        mssv: 20183619,
        birthday: '2000/03/02',
        province: 'Thành phố  Hà Nội',
        district: 'Đông Anh',
        status: userStatusEnum.ACTIVE,

        avatar_name: '',
        slogan: 'Trói em bằng cà vạt',
        location: '....',
        password
    }, {
        email: 'user5@gmail.com',
        full_name: 'bot 5',
        gender: 1,
        mssv: 20183627,
        birthday: '2000/03/02',
        province: 'Thành phố  Hà Nội',
        district: 'Đông Anh',
        status: userStatusEnum.ACTIVE,

        avatar_name: '',
        slogan: 'Trói em bằng cà vạt',
        location: '....',
        password
    }, {
        email: 'user6@gmail.com',
        full_name: 'bot 6',
        gender: 1,
        mssv: 20193627,
        birthday: '2000/03/02',
        province: 'Thành phố  Hà Nội',
        district: 'Đông Anh',
        status: userStatusEnum.ACTIVE,

        avatar_name: '',
        slogan: 'Trói em bằng cà vạt',
        location: '....',
        password
    }, {
        email: 'user7@gmail.com',
        full_name: 'bot 1',
        gender: 1,
        mssv: 201936299,
        birthday: '2000/03/02',
        province: 'Thành phố  Hà Nội',
        district: 'Đông Anh',
        status: userStatusEnum.ACTIVE,

        avatar_name: '',
        slogan: 'Trói em bằng cà vạt',
        location: '....',
        password
    }, ]);
};