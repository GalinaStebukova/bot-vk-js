const VkBot = require('node-vk-bot-api'); // основная библиотека для работы с vk api
const VK = require('vk-node-sdk'); // дополнительная библиотека для работы с другими методами vk api
const Markup = require('node-vk-bot-api/lib/markup'); // библиотека для сборки клавиатуры
const Scene = require('node-vk-bot-api/lib/scene'); // библиотека для создания сцен (комнат)
const Session = require('node-vk-bot-api/lib/session');
const Stage = require('node-vk-bot-api/lib/stage');
const FormulaParser = require('hot-formula-parser').Parser; // библиотека для калькулятора с формулами
const TOKEN = "4b09211c76413d22f462f412388362ab35c727a3c94ed6192b9da2a8fded3063065a693c65bcf3e2c85fe"; // токкен группы

// основаня клавиатура
const main_keyboard = [
    [
    	Markup.button('🐾 Привет 🐾', 'primary'),
    	Markup.button('🙊 Фото 🙊', 'primary'),
    ],
    [
      	Markup.button('🧠 Простой калькулятор 🧠', 'primary'),
    ],
    [
      	Markup.button('💪 Супер калькулятор 💪', 'primary'),
    ],
];

// клавиатура с кнопкой "назад"
const back_keyboard = [
    [
      	Markup.button('⬅ Назад ⬅', 'primary'),
    ]
];

const bot = new VkBot(TOKEN); // создание основной константы для работы с группой
const Group = new VK.Group(TOKEN); // создание дополнительной константы для работы с группой

const parser = new FormulaParser(); // создание константы для работы с формулами


// создание сцены (комнаты) "простой калькулятор"
const scene_sumple_calc =  new Scene('sumple_calc', 
  (ctx)  =>  {
    ctx.scene.next(); // переходим в первый шаг
    ctx.reply('Введите данные.\nНапример: 2 + 2\n‼Пробелы обязательны‼\n(Доступно "+", "-", "*", "/")',
    	null, Markup.keyboard(back_keyboard)); // выводим сообщение и кнопку "назад"
  },
  (ctx)  =>  {
    console_log(ctx.message); // вывод данных о сообщение пользователя в консоль
    if(ctx.message.text == "⬅ Назад ⬅") // если была нажата кнопка "назад"
  	{
  		ctx.scene.leave(); // выходим с сцены (комнаты)
  		ctx.reply("⬇ Вот список моих комманд: ⬇", null, Markup.keyboard(main_keyboard)); // отправляем сообщение и основную клавиатуру
  	}
  	else
  	{
  		let calc = new Calculator(); // иначе подключаем простой калькулятор
        let result = calc.calculate(ctx.message.text); // получаем результат простых вычислений
  		ctx.reply(result, null, Markup.keyboard(back_keyboard)); // отправляем резудьтат и кнопку "назад"
    	ctx.scene.stage = 0; // обнуляем шаг сцены для повторного ввода примера
  	}
  },
);

// создание сцены (комнаты) "супер калькулятор"
const scene_super_calc =  new Scene('super_calc', 
  (ctx)  =>  {
    ctx.scene.next(); // переходим в первый шаг
    ctx.reply('Введите данные.\nВозможности:\n📌Оператры: "+", "-", "*", "/", "^"\n📌Константы: Pi(), E()\n📌Функции: Sqrt(), Abs(), Sin(), Cos(), Tan(), Log(), Min(), Max(), Ceiling()\n\nНапример:\nSqrt(Pi() ^ 5) + Cos(25) / 2 = 17.9890...',
     null, Markup.keyboard(back_keyboard)); // выводим сообщение и кнопку "назад"
  },
  (ctx)  =>  {
    console_log(ctx.message); // вывод данных о сообщение пользователя в консоль
    if(ctx.message.text == "⬅ Назад ⬅") // если была нажата кнопка "назад"
  	{
  		ctx.scene.leave(); // выходим с сцены (комнаты)
  		ctx.reply("⬇ Вот список моих комманд: ⬇", null, Markup.keyboard(main_keyboard)); // отправляем сообщение и основную клавиатуру
  	}
  	else
  	{
  		let calc_result = parser.parse(ctx.message.text); // получаем результат выполнения функций из сообщения пользователя
        let result; // создаем пустую переменную в которую позже запишем результат

  		if(calc_result.result == null) // если резульат выполнения пустой
  		{
  			// result = calc_result.error;
  			result = "🤡 Опа! Ошибочка... 🤡"; // записываем текст ошибки
  		}
  		else result = calc_result.result; // иначе записываем результат

  		ctx.reply(String(result), null, Markup.keyboard(back_keyboard)); // выводим результат и кнопку "назад"
    	ctx.scene.stage = 0; // обнуляем шаг сцены для повторного ввода функций
  	}
  },
);

const session =  new Session(); // создаем сессию
const stage =  new Stage(scene_sumple_calc, scene_super_calc); // создаем этап из спика сцен (комнат)

bot.use(session.middleware()); // "включаем" сессию
bot.use(stage.middleware()); // включаем сцены (комнаты)

// по нажатию кнопки заходим в сцену (комнту) "простой калькулятор"
bot.command('🧠 Простой калькулятор 🧠',  (ctx)  =>  {
    console_log(ctx.message); // вывод данных о сообщение пользователя в консоль
    ctx.scene.enter('sumple_calc');
});

// по нажатию кнопки заходим в сцену (комнту) "супер калькулятор"
bot.command('💪 Супер калькулятор 💪',  (ctx)  =>  {
    console_log(ctx.message); // вывод данных о сообщение пользователя в консоль
    ctx.scene.enter('super_calc');
}) 

// запускаем бота
bot.startPolling(() => {
    console.log('[BOT] Бот успешно запущен!'); // сообщение в консоль об удачном запуске
});

// получаем сообщения
bot.on((ctx) => {
	let message = ctx.message; // сообщение пользователя
    let user_id = ctx.message.peer_id; // id пользователя

	console_log(message); // вывод данных о сообщение пользователя в консоль

    if(message.text == '🐾 Привет 🐾' || message.text == 'Начать') // если сообщение "привет" или "начать"
    {
        ctx.reply('Привет! 👋\n⬇ Вот список моих комманд: ⬇', null, Markup.keyboard(main_keyboard)); // вывод приветсвия
    }
    else if(message.text == '🙊 Фото 🙊') // если сообщение "фото"
    {
        // отпрвка сообщения и лог в консоль
        Group.sendMessage({user_id: user_id, message: 'Эээ...', attachment: 'photo-195403321_457239017', keyboard: Markup.keyboard(main_keyboard)},
          (messageId, error) => {
              if (messageId) {
               console.log('Сообщение с фото отправлено!\n message_id: ', messageId)
              } else {
               console.log('Не удалось отправить сообщение с фото... ', error)
              }
          }
        );
    }
	else
    {
        // вывод сообщения если нет комманды
        ctx.reply("🤷‍ Я не знаю такой команды... 🤷‍\n⬇ Вот список моих комманд: ⬇", null, Markup.keyboard(main_keyboard));
    }
});

// функция "простой калькулятор"
function Calculator()
{
	this.methods = {
		"+" : (a, b) => a + b,
		"-" : (a, b) => a - b,
		"*" : (a, b) => a * b,
		"/" : (a, b) => a / b
	};

	this.calculate = function(str) {
		let split = str.split(' '),
			a = +split[0],
			op = split[1],
			b = +split[2];

		console.log("\na = " + a + " op = " + op + " b = " + b);

		if(!this.methods[op] || isNaN(a) || isNaN(b)) {
			return "🤡 Опа! Ошибочка... 🤡";
		}

		console.log("Ответ = " + this.methods[op](a, b));

		return String(this.methods[op](a, b));
	}
}

// функция вывода данных сообщения пользователя в консоль
function console_log(message)
{
    console.log('\n----------');
    for (var prop in message) {
        console.log("obj." + prop + " = " + message[prop]);
    }
    console.log('----------');
}