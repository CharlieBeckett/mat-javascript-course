// Ways of handling async

first(second);

first().then(
        second().then(
            third().then(
               forth(), "error handling"
        ) , "error handler"
        ), "error handler");
        
        

async function runner() {

    printName();
    await first();
    await second();
    await third();

}

