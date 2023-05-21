import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Chat } from '../models/chat';
import { Message } from '../models/message';
import { ChatService } from '../services/chat.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  chatForm: FormGroup;
  editForm: FormGroup;
  message: string=''
  messageID:any;
  chatObj: Chat = new Chat();
  messageObj: Message = new Message();
  // chatId: number = 22;
  public messageList: any = [];
  public chatList: any = [];
  replymessage: String = "checking";
  public chatData: any;
  msg = "Good work";
  chatId: any = sessionStorage.getItem('chatId');
  color = "";
  secondUserName = "";
  public alluser: any = [];
  arraySinRepetidos: any[] = [];
  arrayCombinado: any[] = [];
  check = sessionStorage.getItem('username');
  timesRun = 0;
  timesRun2 = 0;


  firstUserName = sessionStorage.getItem('username');
  senderEmail = sessionStorage.getItem('username');
  senderCheck = sessionStorage.getItem('username');

  constructor(
    private chatService: ChatService,
    private router: Router,
    private userService: UserService,
    private cdref: ChangeDetectorRef) {

    this.chatForm = new FormGroup({
      replymessage: new FormControl()
    });

  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }


  ngOnInit(): void {
    
    setInterval(() => {
      this.chatService.getChatById(sessionStorage.getItem('chatId')).subscribe(data => {
        this.chatData = data;
        this.secondUserName = this.chatData.secondUserName;
        this.firstUserName = this.chatData.firstUserName;


        this.chatService.getAllMessagesByChatId(this.chatId).subscribe(data => {
        // console.log(data);
        this.chatData = data;
        this.messageList = this.chatData;
      });
      });

    }, 1000);


    this.cdref.detectChanges();


    let getByname = setInterval(() => {
      this.chatService.getChatByFirstUserNameOrSecondUserName(sessionStorage.getItem('username')).subscribe(data => {
        // console.log(data);
        this.chatData = data;
        this.chatList = this.chatData;
      });

      this.timesRun2 += 1;
      if (this.timesRun2 === 2) {
        clearInterval(getByname);
      }
    }, 1000);

    let all = setInterval(() => {

      this.userService.getAll().subscribe((data) => {
        // console.log(data);

        this.alluser = data;
      })

      this.timesRun += 1;
      if (this.timesRun === 2) {
        clearInterval(all);
      }
    }, 1000);
  }

  

  loadChatByEmail(event: string, event1: string) {
    console.log(event, event1);
    // For removing the previous chatId
    sessionStorage.removeItem("chatId");

    // For checking the chat room by both the emails , if there is present then it will give the chat Id in sessionStorage
    this.chatService.getChatByFirstUserNameAndSecondUserName(event, event1).subscribe(data => {
      // console.log(data);
      this.chatData = data;
      this.chatId = this.chatData[0].chatId;
      console.log(this.chatId);
      sessionStorage.setItem('chatId', this.chatId)


      setInterval(() => {
        this.chatService.getChatById(this.chatId).subscribe(data => {
          this.chatData = data;
          this.secondUserName = this.chatData.secondUserName;
          this.firstUserName = this.chatData.firstUserName;

          this.chatService.getAllMessagesByChatId(this.chatId).subscribe(data => {
            console.log(data);
            this.chatData = data;
            this.messageList = this.chatData;
          });
        });
      }, 1000)

    });

  }

  sendMessage() {
    console.log(this.chatForm.value);
    this.messageObj.replymessage = this.chatForm.value.replymessage;
    this.messageObj.senderEmail = this.senderEmail;
    this.chatObj.chatId = this.chatId;
    this.messageObj.chat = this.chatObj;
    this.chatService.addMessageToChatRoom(this.messageObj).subscribe(data => {
      console.log(data);
      this.chatForm.reset();
      this.chatService.getAllMessagesByChatId(this.chatId).subscribe(data => {
        console.log(data);
        this.chatData = data;
        this.messageList = this.chatData.messageList;
        this.secondUserName = this.chatData.secondUserName;
        this.firstUserName = this.chatData.firstUserName;

      })
    });
    let getByname = setInterval(() => {
      this.chatService.getChatByFirstUserNameOrSecondUserName(sessionStorage.getItem('username')).subscribe(data => {
        this.chatData = data;
        this.chatList = this.chatData;
      });

      this.timesRun2 += 1;
      if (this.timesRun2 === 2) {
        clearInterval(getByname);
      }
    }, 1);

  }

  routeHome() {
    this.router.navigateByUrl('');
  }

  goToChat(username: any) {
    this.chatService.getChatByFirstUserNameAndSecondUserName(username, sessionStorage.getItem("username")).subscribe(
      (data) => {
        this.chatId = data.chatId;
        sessionStorage.setItem("chatId", this.chatId);
      },
      (error) => {
        if (error.status == 404) {
          this.chatObj.firstUserName = sessionStorage.getItem("username");
          this.chatObj.secondUserName = username;
          this.chatService.createChatRoom(this.chatObj).subscribe(
            (data) => {
              this.chatData = data;
              this.chatId = this.chatData.chatId;
              sessionStorage.setItem("chatId", this.chatData.chatId);
            })
        } else {

        }
      });
    
  }

  deleteChat(id:any)
  {

    this.chatService.deleteChat(id).subscribe(data => {
      alert("Chat Eliminado")
      let getByname = setInterval(() => {
        // For getting all the chat list whose ever is logged in.
        this.chatService.getChatByFirstUserNameOrSecondUserName(sessionStorage.getItem('username')).subscribe(data => {
          // console.log(data);
          this.chatData = data;
          this.chatList = this.chatData;
        });
  
        this.timesRun2 += 1;
        if (this.timesRun2 === 2) {
          clearInterval(getByname);
        }
      }, 1000);

     }, error => {
      console.log(error);
    });
  }

  deleteMsg(id:any){

    console.log(id)
    this.chatService.deleteMessage(id).subscribe(data => {
      alert("Mensaje Eliminado")
    })

  }
  getId(id:any)
  {
    this.messageID=id;
    console.log(this.messageID);
  }
  editMsg(){
    console.log(this.messageID);
    console.log(this.message);
    this.chatService.editMessage(this.messageID, this.message).subscribe(data => {
      alert("Mensaje Editado")
      
    })
    const modalEdit = document.getElementById('modalEdit');
          if (modalEdit) {
            // Cerrar el modal utilizando Bootstrap
            (window as any).$(`#${modalEdit.id}`).modal('hide');
          }
  }
  
}
