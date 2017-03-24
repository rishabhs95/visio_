$(function(){
    $('a.say').on('click', function(e){
        e.preventDefault();
        var text = $('input[name="text"]').val();
        text = encodeURIComponent(text);
        console.log(text);
        var url = "https://translate.google.com/translate_tts?ie=UTF-8&q=" + text + "&tl=en";
        $('audio').attr('src', url).get(0).play();
    })
});
