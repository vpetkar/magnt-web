// module
var magntControllers = angular.module('magntControllers', []);

// Signup view
magntControllers.controller('SignupView', ['$scope', '$http', function($scope, $http){
  $scope.signup = {};
  $scope.signup.submitSignup = function(item, event) {
    var signupDetails = {
      userFname: $scope.signup.userFname,
      userLname: $scope.signup.userLname,
      userEmail: $scope.signup.userEmail,
      userPass: $scope.signup.userPassword
    };
    $http.post('http://api.magnt.co/api/people',
    {fname: signupDetails.userFname, lname: signupDetails.userLname, email: signupDetails.userEmail, password:signupDetails.userPass}).
      success(function(data, status, headers, config){
        if(status == 200) {
          $scope.signupResult = "Thanks for making an account!";
        }
        else {
          $scope.signupResult = "That account already exists. Are you sure you aren't trying to sign in? ";
        }
      }).
      error(function(data, status, headers, config){
        if(status === 422){
          $scope.signupResult = "An account with that email already exists!"
        }
      });
  }
}]);

// Welcome View
magntControllers.controller('WelcomeView', ['$scope', '$http', '$location', 'userData', function($scope, $http, $location, userData){
  if(!userData.getToken()){
    $scope.login = {};
    $scope.login.submitLogin = function(item, event) {
      var loginDetails = {
        userEmail: $scope.login.userEmail,
        userPassword: $scope.login.userPassword
      };
      $http.post('http://api.magnt.co/api/people/login',
      {email: loginDetails.userEmail, password:loginDetails.userPassword}).
        success(function(data, status, headers, config){
          if(status == 200) {
            userData.setToken(data.id);
            userData.setUserId(data.userId);
            if(userData.getToken()){
              $scope.loginResult = "Thanks for logging in!";
              $location.path('/magnets');
            }
          }
          else {
            $scope.loginResult = "A user with that email and password combination does not exist.";
          }
        }).
        error(function(data, status, headers, config){
          $scope.loginResult = "A user writh that email and password combination does not exist";
        });
      }
    }
    else{
      $location.path('/magnets');
    }
}]);

// List Magnets
magntControllers.controller('MagnetListCtrl', ['$scope', '$http', '$location', 'userData', function($scope, $http ,$location, userData){
  if(userData.getToken()){
    $http.get('http://api.magnt.co/api/magnets').
      success(function (data, status, headers, config){
        $scope.magnetList = data;
      }).
      error(function (data, status, headers, config){
      });
  }
  else {
    $location.path('/');
  }
}]);

// Magnet View
magntControllers.controller('MagnetViewCtrl', ['$scope', '$http', '$location', '$routeParams', '$anchorScroll', function($scope, $http ,$location, $routeParams, $anchorScroll){
  $scope.magnetId = $routeParams.magnetId;
  $http.get('http://api.magnt.co/api/magnets/' + $routeParams.magnetId).
    success(function (data, status, headers, config){
      $scope.magnetInfo = data;
    }).
    error(function (data, status, headers, config){
    });
}]);

// List questions
magntControllers.controller('QuestionListCtrl', ['$scope', '$http', '$location', '$routeParams', 'apiQuestions', function($scope, $http ,$location, $routeParams, apiQuestions){
  $scope.magnetId = $routeParams.magnetId;
  apiQuestions.getQuestions(1).then(function(d) {
    $scope.questionList = d.data;
  });
}]);

// Post question
magntControllers.controller('AskQuestion', ['$scope', '$http', '$routeParams', 'userData', 'apiQuestions', function($scope, $http, $routeParams, userData, apiQuestions){
  $scope.ask = {};
  $scope.ask.submitQuestion = function(item, event) {
    var askDetails = {
      questionText: $scope.ask.questionText,
      magnetid: $routeParams.magnetId,
      personid: userData.getUserId()
    };
    $http.post('http://api.magnt.co/api/questions',
    {questionText: askDetails.questionText, personid: askDetails.personid, magnetid: askDetails.magnetid, up:1, down:0}).
      success(function(data, status, headers, config){
        if(status == 200) {
          $scope.askResult = "Got your question.";
          apiQuestions.getQuestions(askDetails.magnetid).then(function(d) {
            $scope.questionList = d.data;
          });
        }
        else {
          $scope.askResult = "There was an error submitting your question";
        }
      }).
      error(function(data, status, headers, config){
        $scope.askResult = "There was an error submitting your question";
      });
  }
}]);

// List Answers

magntControllers.controller('ListAnswers', ['$scope', '$http', '$routeParams', 'userData', function($scope, $http, $routeParams, userData){
  $scope.questionId = $routeParams.questionId;
  $http.get('http://api.magnt.co/api/answers/?filter[where][questionid]=' + $routeParams.questionId + '&filter[include]=person').
    success(function (data, status, headers, config){
      $scope.answerList = data;
    }).
    error(function (data, status, headers, config){
    });
}]);


// Post answer

magntControllers.controller('AnswerQuestion', ['$scope', '$http', '$location', '$routeParams', 'userData', function($scope, $http , $location, $routeParams, userData){
  $scope.questionId = $routeParams.questionId;
  $scope.answer = {};
  $scope.answer.submitAnswer = function(item, event) {
    var answerDetails = {
      answertext: $scope.answer.answerText,
      magnetid: $routeParams.magnetId,
      questionid: $scope.questionId,
      personid: userData.getUserId()
    };
    $scope.answerList.push(answerDetails);
    $http.post('http://api.magnt.co/api/answers',
    {answertext: answerDetails.answertext, personid: answerDetails.personid, questionid: answerDetails.questionid}).
      success(function(data, status, headers, config){
        if(status == 200) {
          $scope.answerResult = "Got your answer!";
        }
        else {
          $scope.answerResult = "There was an error submitting your answer";
        }
      }).
      error(function(data, status, headers, config){
        $scope.answerResult = "There was an error submitting your answer";
      });
  }
}]);
