function DEBUG(data) {
    console.log(data);
}

function main() {
    var quizCtrl = new QuizCtrl();

    $('#quiz-form')
        .on('submit', function (e) {
            if (!$('input[name="answerOptions"]').is(':checked')) { // No choice selected
                $('#alert-submit-no-answer').show();
                return false;
            } else {
                $('#alert-submit-no-answer').hide();
                var userAnswer = $('#quiz-form input[name=answerOptions]:checked').val()
                quizCtrl.scoreAnswer(userAnswer);
            }
            e.preventDefault();
        })
        .on('click', '[data-hide]', function () {
            $('.' + $(this).attr('data-hide')).hide();
        })

    $('#start-quiz-container')
        .on('click', '#start-quiz-btn', function () {
            $('#start-quiz-container').hide();
            $('#quiz-content').show();
        })

    $('#quiz-score-container')
        .on('click', '#retry-quiz-btn', function () {
            location.reload();
        })

    $('#score-answer-modal')
        .on('hidden.bs.modal', function () {
            if (quizCtrl.quizCompleted()) {
                quizCtrl.showQuizScore();
            } else {
                quizCtrl.loadQuestion();
                quizCtrl.updateProgress();
            }
        })
}

function QuizCtrl() {
    var currentQuiz;
    var thisCtrl = this;

    $.getJSON("/quiz-data/quiz.json", function (data) {
        currentQuiz = new Quiz(data);

        thisCtrl.initializeProgressBar();
        thisCtrl.loadQuestion();
    });

    this.quizCompleted = function () {
        if (currentQuiz.quizCompleted())
            return true;
        else
            return false;
    }

    this.showQuizScore = function () {
        var score = currentQuiz.getQuizScore()
        $('#quiz-submit-button').attr('disabled', 'disabled');
        $('#quiz-body').hide();
        $('#quiz-score-container').show();
        $('#quiz-progress .progress-step:last-child').removeClass('active');
        $('#quiz-progress .progress-step:last-child').addClass('complete');
        $('#quiz-score').text(score + '%');
        if (score >= 70) {
            $('#quiz-score-text').text('Woah, you certainly know your animals!');
        } else {
            $('#quiz-score-text').text('You may want to brush up on your animal facts. Try again?');
        }
    }

    this.scoreAnswer = function (answer) {
        if (currentQuiz.submitAnswer(answer)) {
            $('#quiz-progress .progress-step.active').addClass('correct');
            $('#score-answer-modal .modal-title').text('Correct!');
        } else {
            $('#quiz-progress .progress-step.active').addClass('incorrect');
            $('#score-answer-modal .modal-title').text('Incorrect');
        }
        $('#score-answer-modal').modal('show');
    }

    this.loadQuestion = function () {
        var quizData = currentQuiz.getCurrentQuizData()

        DEBUG(quizData);
        var quizElems = $('#quiz-body')
        
        // set quiz image if available, otherwise center quiz-panel
        if (quizData.quizArray.img.length > 0) {
            quizElems.find('.quiz-question-image').show();
            quizElems.find('.quiz-question-image img').attr('src', '/quiz-data/' + quizData.quizArray.img);
        } else {
            quizElems.find('.quiz-question-image').hide();
            quizElems.find('.quiz-panel').addClass('col-center');
        }

        // Set question text
        quizElems.find('#quiz-question').text('#' + quizData.questionNum + ': ' + quizData.quizArray.question);

        var quizPanel = quizElems.find('.panel-body .list-group').empty();
        switch (quizData.quizArray.type) {
        case 'multi-choice':
            for (var i = 0; i < quizData.quizArray.choices.length; i++) {
                quizPanel.append('<li class="list-group-item"><div class="radio"><label><input type="radio" name="answerOptions" value="' + i + '"> ' + quizData.quizArray.choices[i] + '</label></div></li>');
            }
            break;
        case 'written-number':
            break;
        case 'true-false':
                alert("True/False");
            break;
        }

    }

    this.initializeProgressBar = function () {
        var numQuestions = currentQuiz.getQuizLength();
        $('#quiz-progress').children().remove();
        for (i = 0; i < numQuestions; i++) {
            var progressElem = $('.templates .progress-step').clone();
            $('#quiz-progress').append(progressElem);
        }
        $('#quiz-progress .progress-step').width(100 / numQuestions + '%');
        $('#quiz-progress .progress-step').eq(0).addClass('active');
    }

    this.updateProgress = function () {
        var num = currentQuiz.CurrentQuestion();
        if (num > 0) {
            $('#quiz-progress .progress-step').eq(num - 1).removeClass('active');
            $('#quiz-progress .progress-step').eq(num - 1).addClass('complete');
        }
        $('#quiz-progress .progress-step').eq(num).addClass('active');
    }
}


function Quiz(quizArray) {
    var currentQuestion = 0;
    this.CurrentQuestion = function () {
        return currentQuestion;
    }

    var correctAnswers = 0;
    var quizData = quizArray; //Loads questions array
    var quizLength = quizData.length;

    this.getCurrentQuizData = function () {
        var currentQuizData = {
            quizArray: quizData[currentQuestion],
            questionNum: currentQuestion + 1
        }
        return currentQuizData;
    }
    this.getQuizLength = function () {
        return quizLength;
    }

    this.submitAnswer = function (userAnswer) {
        if (userAnswer == quizData[currentQuestion].answerIndex) {
            correctAnswers++;
            var isCorrect = true;
        } else
            var isCorrect = false;
        currentQuestion++;
        return isCorrect;
    }

    this.quizCompleted = function () {
        if (currentQuestion >= quizLength)
            return true;
        else
            return false;
    }

    this.getQuizScore = function () {
        var score = Math.round(correctAnswers / quizLength * 100);
        return score;
    }
}

$(document).ready(function () {
    main();
})