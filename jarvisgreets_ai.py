from google import genai
jarvis = genai.Client(api_key="AIzaSyDuOUgSwTLWqXxjdnAyFbxQAsS8laXmuO8")
    

#a function that greets the user with their name 
def greeting():
    name = input("what is your name?: ").strip().title()
    print(f"Hello, {name}!")

# checking for keywords in the prompt and responding accordingly
def checkfor_keys(prompt):
    match prompt.lower():
        case "quit":
            print("Goodbye!")
            exit()
        case "help":
            print("You can ask me anything! Just type your question and I'll do my best to help you. If you want to exit, just type 'quit'.")
           
        case "clear":
            print("\n "*100)
           

        case _:

            response = jarvis.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
            )
            print("Jarvis:", response.text)
        

        
def ask_for_prompt():
    while True:
        prompt = input("your prompt: ").strip()
        checkfor_keys(prompt)
        
greeting()
ask_for_prompt()

