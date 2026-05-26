from google import genai

#a function that handles the api call
def generate_response(prompt):
    jarvis = genai.Client(api_key="AIzaSyAMnBZCclJZE3-skqyLBJK4z1I8NsqwCeE")

    if prompt.lower() == "quit":
     print("Goodbye!")
     exit()
    else:
        response = jarvis.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    print("Jarvis:", response.text)
    print()

#a function that greets the user with their name 
def greeting():
    name = input("what is your name?: ").strip().title()
    print(f"Hello, {name}!")


def main():
    greeting()
    while True:
        prompt = input("your prompt: ").strip()
        generate_response(prompt)

main()
