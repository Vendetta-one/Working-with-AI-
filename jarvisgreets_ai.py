from google import genai
jarvis = genai.Client(api_key="YOUR API KEY")
    
#creating the history list
history = []

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

            case "history":
             
                print ()
           

            case _:

                response = jarvis.models.generate_content(
                model="gemini-2.5-flash",
                contents = prompt
                )
                print("Jarvis:", response.text)
                return response.text
        

#function that keeps on asking for the prompts.      
def ask_for_prompt():
    while True:
        prompt = input("your prompt: ").strip()
        checkfor_keys(prompt)


        #this thing is so ask_for_prompt knows what the response from jarvis is:
        response = checkfor_keys(prompt)

        #now we make the entry into the list [using .append()] [list name: "history"]
        if response:
            history.append({"user": prompt, "jarvis": response})
            

        
if __name__ == "__main__":
    greeting()
    ask_for_prompt()


