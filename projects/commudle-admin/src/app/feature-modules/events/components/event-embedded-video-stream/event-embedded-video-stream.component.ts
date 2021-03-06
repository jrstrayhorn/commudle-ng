import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { IEvent } from 'projects/shared-models/event.model';
import { ICommunity } from 'projects/shared-models/community.model';
import { FormBuilder, Validators } from '@angular/forms';
import { EmbeddedVideoStreamsService } from 'projects/commudle-admin/src/app/services/embedded-video-streams.service';
import { IEmbeddedVideoStream } from 'projects/shared-models/embedded_video_stream.model';
import { EEmbeddedVideoStreamSources } from 'projects/shared-models/enums/embedded_video_stream_sources.enum';
import { LibToastLogService } from 'projects/shared-services/lib-toastlog.service';
import { LibAuthwatchService } from 'projects/shared-services/lib-authwatch.service';
import { ICurrentUser } from 'projects/shared-models/current_user.model';

@Component({
  selector: 'app-event-embedded-video-stream',
  templateUrl: './event-embedded-video-stream.component.html',
  styleUrls: ['./event-embedded-video-stream.component.scss']
})
export class EventEmbeddedVideoStreamComponent implements OnInit, OnDestroy {
  @Input() event: IEvent;
  @Input() community: ICommunity;
  authSubs;
  EEmbeddedVideoStreamSources = EEmbeddedVideoStreamSources;

  evs = <IEmbeddedVideoStream> {};
  youtubeVideoId: string;
  embeddedVideoUrl: any;
  currentUser: ICurrentUser;

  embeddedVideoStreamForm = this.fb.group({
    streamable_type: ['', Validators.required],
    streamable_id: ['', Validators.required],
    source: ['', Validators.required],
    embed_code: ['', Validators.required],
    zoom_host_email: ['', Validators.email],
    zoom_password: ['']
  });

  constructor(
    private fb: FormBuilder,
    private embeddedVideoStreamsService: EmbeddedVideoStreamsService,
    private toastLogService: LibToastLogService,
    private authService: LibAuthwatchService
  ) { }

  ngOnInit() {
    this.embeddedVideoStreamForm.patchValue({
      streamable_type: 'Event',
      streamable_id: this.event.id
    });

    this.getEmbeddedVideoStream();

    this.authSubs = this.authService.currentUser$.subscribe(
      data => this.currentUser = data
    );
  }

  ngOnDestroy() {
    this.authSubs.unsubscribe();
  }



  getEmbeddedVideoStream() {
    this.embeddedVideoStreamsService.get(this.event.id).subscribe(
      data => {
        if (data) {
          this.evs = data;
          this.embeddedVideoStreamForm.patchValue(data);
          this.updateValidators();
        }
      }
    );
  }


  createOrUpdate() {
    this.embeddedVideoStreamsService.createOrUpdate(this.embeddedVideoStreamForm.value).subscribe(
      data => {
        this.evs = data;
        this.embeddedVideoStreamForm.patchValue(data);
        this.updateValidators();
        this.toastLogService.successDialog('Saved!');
      }
    );
  }

  updateValidators() {
    if (this.embeddedVideoStreamForm.get('source').value === EEmbeddedVideoStreamSources.ZOOM) {
      this.embeddedVideoStreamForm.get('zoom_host_email').setValidators([Validators.required, Validators.email]);
      this.embeddedVideoStreamForm.get('zoom_password').setValidators(Validators.required);
    } else {
      this.embeddedVideoStreamForm.get('zoom_host_email').clearValidators();
      this.embeddedVideoStreamForm.get('zoom_password').clearValidators();
    }

    this.embeddedVideoStreamForm.get('zoom_host_email').updateValueAndValidity();
    this.embeddedVideoStreamForm.get('zoom_password').updateValueAndValidity();
  }


}
