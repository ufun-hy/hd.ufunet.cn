// 大屏单人详情得分区的预览场景。old* 为改版前的展示，用来对比高度。
window.SCORE_FORMULA_FIXTURES = {
    'normal-old': {
        label: '普通模式 · 改版前（场外 + 调整）',
        old: 'normal',
        final: '76.32',
        pills: [['去最高', '9.50分'], ['去最低', '6.00分'], ['超时扣分', '+30.12分'], ['场内60%', '17.00分'], ['网络投票40%', '90.00分']]
    },
    'normal-offsite': {
        label: '普通模式 · 场外分数 + 人工调整',
        final: '76.32',
        basic: 30.12,
        msg: { openpubpw: '2', scoretype: '1', pfmode: '2', maxmintype: '1', maxscore: '9.50', minscore: '6.00', score: '46.20', score2: '76.32', basicscore: '30.12', score_reason: '超时扣分', offsite: { title: '网络投票', weight: 40, score: '90.00', onsite: '17.00' } }
    },
    'normal-adjust': {
        label: '普通模式 · 只有人工调整',
        final: '41.00',
        basic: -5,
        msg: { openpubpw: '2', scoretype: '1', pfmode: '1', score: '46.00', score2: '41.00', basicscore: '-5.00', score_reason: '超时' }
    },
    'normal-plain': {
        label: '普通模式 · 无调整',
        final: '46.00',
        basic: 0,
        msg: { openpubpw: '2', scoretype: '1', pfmode: '2', maxmintype: '1', maxscore: '9.50', minscore: '6.00', score: '46.00', basicscore: '0' }
    },
    'normal-dechidden': {
        label: '普通模式 · 关闭“显示扣分与最终得分”且有调整',
        final: '76.32',
        basic: 30.12,
        hideDec: true,
        msg: { openpubpw: '2', scoretype: '1', pfmode: '1', score: '46.20', score2: '76.32', basicscore: '30.12', offsite: { title: '网络投票', weight: 40, score: '90.00', onsite: '17.00' } }
    },
    'pub-old': {
        label: '大众评委 · 改版前（有调整）',
        old: 'pub',
        final: '87.54',
        pills: [['去最高', '9.50分'], ['去最低', '6.00分'], ['超时扣分', '-2.00分']]
    },
    'pub-plain': {
        label: '大众评委 · 未启用场外 + 调整',
        final: '87.54',
        basic: -2,
        msg: { openpubpw: '1', pubweight: '40', scoretype: '1', pfmode: '2', maxmintype: '1', maxscore: '9.50', minscore: '6.00', score_pw: '90.56', score_pub: '88.00', hadpwnum: 5, pubhadpwnum: 120, score: '89.54', score2: '87.54', basicscore: '-2.00', score_reason: '超时扣分' }
    },
    'pub-offsite': {
        label: '大众评委 · 场外分数（括号）+ 调整',
        final: '87.72',
        basic: -2,
        msg: { openpubpw: '1', pubweight: '40', scoretype: '1', pfmode: '2', maxmintype: '1', maxscore: '9.50', minscore: '6.00', score_pw: '90.56', score_pub: '88.00', hadpwnum: 5, pubhadpwnum: 120, score: '89.72', score2: '87.72', basicscore: '-2.00', score_reason: '超时扣分', offsite: { title: '网络投票', weight: 40, score: '90.00', onsite: '89.54' } }
    },
    'pub-offsite-long': {
        label: '大众评委 · 场外 + 调整（长名称、四位人数）',
        final: '87.72',
        basic: -2,
        msg: { openpubpw: '1', pubweight: '35', scoretype: '1', pfmode: '2', maxmintype: '1', maxscore: '9.50', minscore: '6.00', score_pw: '90.56', score_pub: '88.00', hadpwnum: 15, pubhadpwnum: 1286, score: '89.72', score2: '87.72', basicscore: '-2.00', score_reason: '超过规定时间30秒扣分', offsite: { title: '线上网络投票得分（第一阶段）', weight: 25, score: '90.00', onsite: '89.54' } }
    },
    'pub-only': {
        label: '大众评委 · 大众占比 100%',
        final: '60.00',
        basic: 0,
        msg: { openpubpw: '1', pubweight: '100', scoretype: '2', pfmode: '2', maxmintype: '1', maxscore: '50.00', minscore: '28.78', score_pw: '37.79', score_pub: '60.00', hadpwnum: 6, pubhadpwnum: 35, score: '60.00', basicscore: '0' }
    },
    'pub-dechidden': {
        label: '大众评委 · 关闭“显示扣分与最终得分”且有调整',
        final: '60.00',
        basic: 20,
        hideDec: true,
        msg: { openpubpw: '1', pubweight: '30', scoretype: '2', pfmode: '2', maxmintype: '1', maxscore: '50.00', minscore: '28.78', score_pw: '40.79', score_pub: '38.20', hadpwnum: 6, pubhadpwnum: 35, score: '40.00', score2: '60.00', basicscore: '20.00' }
    },
    'pub-hidepw': {
        label: '大众评委 · 关闭“大屏显示评委分数”',
        final: '87.54',
        basic: -2,
        hidePw: true,
        msg: { openpubpw: '1', pubweight: '40', scoretype: '1', pfmode: '2', maxmintype: '1', maxscore: '9.50', minscore: '6.00', score_pw: '90.56', score_pub: '88.00', hadpwnum: 5, pubhadpwnum: 120, score: '89.54', score2: '87.54', basicscore: '-2.00', score_reason: '超时扣分' }
    },
    'normal-reveal': {
        label: '普通模式 · 主持人亮分，公布前',
        final: '76.32',
        basic: 30.12,
        reveal: true,
        msg: { openpubpw: '2', scoretype: '1', pfmode: '2', maxmintype: '1', maxscore: '9.50', minscore: '6.00', score: '46.20', score2: '76.32', basicscore: '30.12', score_reason: '超时扣分', offsite: { title: '网络投票', weight: 40, score: '90.00', onsite: '17.00' } }
    },
    'pub-reveal': {
        label: '大众评委 · 主持人亮分，公布前',
        final: '87.72',
        basic: 0,
        reveal: true,
        msg: { openpubpw: '1', pubweight: '40', scoretype: '1', pfmode: '2', maxmintype: '1', maxscore: '9.50', minscore: '6.00', score_pw: '90.56', score_pub: '88.00', hadpwnum: 5, pubhadpwnum: 120, score: '89.54', basicscore: '0' }
    }
};
