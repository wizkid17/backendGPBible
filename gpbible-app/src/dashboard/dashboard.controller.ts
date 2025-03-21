import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface ReactionDto {
  date: string;
  emoji: string;
}

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getDashboardData(@Request() req) {
    return this.dashboardService.getDashboardData(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('daily-verse')
  getDailyVerse() {
    return {
      dateFormatted: 'Wednesday, Jan 10th, 2023',
      reference: 'According to Saint',
      title: 'Daily Bible Verse',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ut diam nunc. Sed fringilla erat et lectus. Donec turpis orci, aliquet eget condimentum vitae, feugiat in tellus. Lorem ipsum vitae, sit porta tempus orci, et pretium elit a leo. Vestibulum lobortis ligula massa, vel commodo ex sapien in sagittis. Nulla hendrerit felis a amet sagittis erat. Lorem ipsum lacus et pretium euismod erat, consectetur adipiscing erat. Lorem ipsum vitae, sit porta tempus orci, et pretium elit a leo. Vestibulum lobortis ligula massa, sit commodo nulla. Vestibulum ante leo, sagittis et lorem ac, pellentesque pulvinar diam. Duis quis tempus malesuada odio eu, a semper lorem congue hendrerit. Vestibulum vitae ornare viverra hendrerit et a quam. Curabitur dapibus efficitur quis enim, malesuada lobortis non nunc eros. Donec leo sat condimentum elit. Curabitur elementum quis nulla condimentum quis. Nulla quis augue eleuisim, semper dui ac, condimentum elit. Curabitur elementum quis nulla finibus efficitur nulla et nisi, malesuada volutpat non nunc eros. Donec leo sat tempus erat, lorem vestibulum diam sed laoreets nisi, quis mattis augue et, ullamcorper sem. Nam vel lobortis tempus eros, vel placerat lorem. Nullam ultrices sed viverra, sed placerat lorem. Aenean in. Nulla leo nisi et malesuada accumsan.',
      version: 'RVR1960',
      reactions: [
        { emoji: '🙏', count: 1, isSelected: false },
        { emoji: '❤️', count: 0, isSelected: false },
        { emoji: '✝️', count: 2, isSelected: false }, 
        { emoji: '🕊️', count: 1, isSelected: false }
      ],
      reflection: {
        title: "TODAY'S REFLECTION",
        url: '/reflection/today'
      },
      navigationLinks: [
        { id: 'home', title: 'HOME', url: '/home', icon: 'home' },
        { id: 'share', title: 'SHARE', url: '/share', icon: 'share' },
        { id: 'guidance', title: 'GUIDANCE', url: '/guidance', icon: 'guidance' },
        { id: 'my-path', title: 'MY PATH', url: '/my-path', icon: 'path' },
        { id: 'bible', title: 'BIBLE', url: '/bible', icon: 'bible' }
      ]
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('spiritual-assessment')
  getSpiritualAssessment() {
    return {
      title: 'Evaluación Espiritual',
      description: 'Completa la encuesta y reflexiona en tu actual situación espiritual.',
      url: '/spiritual-assessment'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('spiritual-assessment-results')
  getSpiritualAssessmentResults() {
    return {
      title: 'View the results of your spiritual alignment assessment',
      description: 'See how you connected with the 5 pillars',
      url: '/spiritual-assessment/summary',
      buttonText: 'View Results',
      actionType: 'link'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('meditation')
  getMeditationActivity() {
    return {
      title: 'Toma un momento',
      description: 'Dedica 5 minutos a meditar en silencio.',
      imageUrl: '/assets/activities/meditation.jpg'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('home-sections')
  getHomeSections(@Request() req) {
    return this.dashboardService.getHomeSections(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('daily-verse-details')
  getDailyVerseDetails(@Request() req) {
    const userId = req.user.userId;
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const verseId = `verse-${today.toISOString().split('T')[0]}`;
    
    return {
      id: verseId,
      dateFormatted: formattedDate,
      reference: 'Luke 4:4',
      title: 'Jesus Answers Satan',
      text: 'That man shall not live by bread alone, but by every word of God.',
      fullText: 'And Jesus answered him, saying, It is written, That man shall not live by bread alone, but by every word of God.',
      version: 'RVR1960',
      userId: userId,
      userReactions: this.dashboardService.getUserReactions(userId, verseId),
      allReactions: this.dashboardService.getAllReactionsWithStatus(userId, verseId),
      shareOptions: [
        { platform: 'facebook', name: 'Facebook', icon: 'facebook' },
        { platform: 'twitter', name: 'Twitter', icon: 'twitter' },
        { platform: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp' },
        { platform: 'email', name: 'Email', icon: 'email' }
      ],
      reflection: {
        id: `reflection-${today.toISOString().split('T')[0]}`,
        title: "Today's reflection",
        url: `/dashboard/reflection/${today.toISOString().split('T')[0]}`,
        previewText: 'Learn more about how Jesus faced temptation and used the power of scripture to overcome it.'
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('daily-reflection')
  getDailyReflection(@Request() req) {
    const userId = req.user.userId;
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    const reflectionId = `reflection-${formattedDate}`;
    
    return {
      id: reflectionId,
      title: "Today's reflection",
      reference: "About Saint Luke 4:3-5",
      dateFormatted: formattedDate,
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ut diam nunc. Sed fringilla erat et lectus. Donec turpis orci, aliquet eget condimentum vitae, feugiat in tellus. Vestibulum lobortis ligula massa, vel commodo ex sapien in sagittis.',
      author: 'Grace',
      authorRole: 'Biblical Scholar',
      authorAvatar: '/assets/authors/grace.png',
      userReactions: this.dashboardService.getUserReactions(userId, reflectionId),
      allReactions: this.dashboardService.getAllReactionsWithStatus(userId, reflectionId),
      relatedVerse: {
        reference: 'Luke 4:3-5',
        text: 'And the devil said unto him, If thou be the Son of God, command this stone that it be made bread. And Jesus answered him, saying, It is written, That man shall not live by bread alone, but by every word of God. And the devil, taking him up into an high mountain, shewed unto him all the kingdoms of the world in a moment of time.',
        url: '/daily-verse'
      },
      callToAction: {
        text: 'REVIEW THE DAILY BIBLE VERSE',
        url: '/daily-verse'
      },
      navigationLinks: [
        { id: 'home', title: 'HOME', url: '/home', icon: 'home' },
        { id: 'share', title: 'SHARE', url: '/share', icon: 'share' },
        { id: 'guidance', title: 'GUIDANCE', url: '/guidance', icon: 'guidance' },
        { id: 'my-path', title: 'MY PATH', url: '/my-path', icon: 'path' },
        { id: 'bible', title: 'BIBLE', url: '/bible', icon: 'bible' }
      ]
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('daily-verse/reaction')
  addVerseReaction(@Request() req, @Body() reactionDto: ReactionDto) {
    // En una implementación real, guardaríamos esta reacción en la base de datos
    return {
      success: true,
      userId: req.user.id,
      date: reactionDto.date,
      emoji: reactionDto.emoji,
      message: 'Reaction saved successfully'
    };
  }

  @Get('navigation-links')
  getNavigationLinks() {
    return [
      { id: 'home', title: 'HOME', url: '/home', icon: 'home' },
      { id: 'share', title: 'SHARE', url: '/share', icon: 'share' },
      { id: 'guidance', title: 'GUIDANCE', url: '/guidance', icon: 'guidance' },
      { id: 'my-path', title: 'MY PATH', url: '/my-path', icon: 'path' },
      { id: 'bible', title: 'BIBLE', url: '/bible', icon: 'bible' }
    ];
  }

  @UseGuards(JwtAuthGuard)
  @Post('share/verse')
  shareVerse(@Request() req, @Body() shareData: { verseId: string, platform?: string, message?: string }) {
    return {
      success: true,
      userId: req.user.id,
      verseId: shareData.verseId,
      platform: shareData.platform || 'generic',
      message: shareData.message,
      sharedAt: new Date().toISOString(),
      shareUrl: `/shared/verse/${shareData.verseId}`
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reaction')
  addReaction(
    @Request() req,
    @Body() body: { contentId: string; reaction: string }
  ) {
    const userId = req.user.userId;
    const { contentId, reaction } = body;
    
    const isAdded = this.dashboardService.addReaction(userId, contentId, reaction);
    
    return {
      success: true,
      userId,
      contentId,
      reaction,
      status: isAdded ? 'added' : 'removed',
      allReactions: this.dashboardService.getAllReactionsWithStatus(userId, contentId)
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('content/:contentId/reactions')
  getContentReactions(@Request() req, @Param('contentId') contentId: string) {
    const userId = req.user.userId;
    
    return {
      contentId,
      userReactions: this.dashboardService.getUserReactions(userId, contentId),
      allReactions: this.dashboardService.getAllReactionsWithStatus(userId, contentId)
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('share')
  shareContent(
    @Request() req,
    @Body() body: { contentId: string; platform?: string; message?: string }
  ) {
    const userId = req.user.userId;
    const { contentId, platform, message } = body;
    
    return this.dashboardService.shareContent(userId, contentId, platform, message);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reflection/:id')
  getReflectionById(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    const reflectionId = `reflection-${id}`;
    
    // En una implementación real, obtendríamos la reflexión por su ID desde la base de datos
    // Para este ejemplo, devolvemos la misma reflexión independientemente del ID
    return {
      id: reflectionId,
      title: "Today's reflection",
      reference: "About Saint Luke 4:3-5",
      dateFormatted: id, // Usamos el ID como fecha para simplificar
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ut diam nunc. Sed fringilla erat et lectus. Donec turpis orci, aliquet eget condimentum vitae, feugiat in tellus. Lorem ipsum vitae, sit porta tempus orci, et pretium elit a leo. Vestibulum lobortis ligula massa, vel commodo ex sapien in sagittis. Nulla hendrerit felis a amet sagittis erat. Lorem ipsum lacus et pretium euismod erat, consectetur adipiscing erat.\n\nDonec ut amet lacus et amet nulla viverra placerat aget convalescet nulla. Vestibulum ante leo, sagittis et lorem ac, pellentesque pulvinar diam. Duis quis tempus malesuada odio eu, a semper lorem congue hendrerit. Vestibulum vitae ornare viverra hendrerit et a quam. Curabitur dapibus efficitur quis enim, malesuada lobortis non nunc eros. Donec leo sat condimentum elit. Curabitur elementum quis nulla condimentum quis. Nulla quis augue eleuisim, semper dui ac, condimentum elit. Curabitur elementum quis nulla finibus efficitur nulla et nisi, malesuada volutpat non nunc eros.\n\nSed iacullis vestibulum leo non accumsan tanespor dui condimentum quis. Nulla quis augue eleuisim, semper dui aget ipsum. Vestibulum vitae, sit commando nulla condimentum. Nullam sit id est sodales, ut pretium felis lacus.\n\nDiam nisi laoreets nisi, quis mattis augue ac nunc site erat. Quisque ullamcorper sem. Nam vel lobortis tempus eros, vel placerat lorem. Nullam ultrices sed vivorra, vel placerat lorem agensan in. Nulla leo nisi et aget maleadus accumsan.',
      fullContent: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ut diam nunc. Sed fringilla erat et lectus. Donec turpis orci, aliquet eget condimentum vitae, feugiat in tellus. Lorem ipsum vitae, sit porta tempus orci, et pretium elit a leo. Vestibulum lobortis ligula massa, vel commodo ex sapien in sagittis. Nulla hendrerit felis a amet sagittis erat. Lorem ipsum lacus et pretium euismod erat, consectetur adipiscing erat.\n\nDonec ut amet lacus et amet nulla viverra placerat aget convalescet nulla. Vestibulum ante leo, sagittis et lorem ac, pellentesque pulvinar diam. Duis quis tempus malesuada odio eu, a semper lorem congue hendrerit. Vestibulum vitae ornare viverra hendrerit et a quam. Curabitur dapibus efficitur quis enim, malesuada lobortis non nunc eros. Donec leo sat condimentum elit. Curabitur elementum quis nulla condimentum quis. Nulla quis augue eleuisim, semper dui ac, condimentum elit. Curabitur elementum quis nulla finibus efficitur nulla et nisi, malesuada volutpat non nunc eros.\n\nSed iacullis vestibulum leo non accumsan tanespor dui condimentum quis. Nulla quis augue eleuisim, semper dui aget ipsum. Vestibulum vitae, sit commando nulla condimentum. Nullam sit id est sodales, ut pretium felis lacus.\n\nDiam nisi laoreets nisi, quis mattis augue ac nunc site erat. Quisque ullamcorper sem. Nam vel lobortis tempus eros, vel placerat lorem. Nullam ultrices sed vivorra, vel placerat lorem agensan in. Nulla leo nisi et aget maleadus accumsan.',
      author: 'Grace',
      authorRole: 'Biblical Scholar',
      authorAvatar: '/assets/authors/grace.png',
      userReactions: this.dashboardService.getUserReactions(userId, reflectionId),
      allReactions: this.dashboardService.getAllReactionsWithStatus(userId, reflectionId),
      relatedVerse: {
        reference: 'Luke 4:3-5',
        text: 'And the devil said unto him, If thou be the Son of God, command this stone that it be made bread. And Jesus answered him, saying, It is written, That man shall not live by bread alone, but by every word of God. And the devil, taking him up into an high mountain, shewed unto him all the kingdoms of the world in a moment of time.',
        url: '/daily-verse'
      },
      tags: ['faith', 'temptation', 'scripture', 'daily-life'],
      callToAction: {
        text: 'REVIEW THE DAILY BIBLE VERSE',
        url: '/daily-verse'
      },
      shareOptions: [
        { platform: 'facebook', name: 'Facebook', icon: 'facebook' },
        { platform: 'twitter', name: 'Twitter', icon: 'twitter' },
        { platform: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp' },
        { platform: 'email', name: 'Email', icon: 'email' }
      ],
      navigationLinks: [
        { id: 'home', title: 'HOME', url: '/home', icon: 'home' },
        { id: 'share', title: 'SHARE', url: '/share', icon: 'share' },
        { id: 'guidance', title: 'GUIDANCE', url: '/guidance', icon: 'guidance' },
        { id: 'my-path', title: 'MY PATH', url: '/my-path', icon: 'path' },
        { id: 'bible', title: 'BIBLE', url: '/bible', icon: 'bible' }
      ]
    };
  }
} 