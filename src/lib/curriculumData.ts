// Complete class-wise curriculum data for Classes 1-8

export interface TopicContent {
  id: string;
  title: string;
  content: string; // structured learning material
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: "activity" | "project";
}

export interface Topic {
  id: string;
  title: string;
  lessons: TopicContent[];
  activities: Activity[];
}

export interface Subject {
  id: string;
  title: string;
  icon: string; // lucide icon name
  color: string; // neon color token
  topics: Topic[];
}

export interface ClassCurriculum {
  classId: string;
  className: string;
  subjects: Subject[];
}

const makeLessons = (titles: string[], subjectPrefix: string): TopicContent[] =>
  titles.map((t, i) => ({
    id: `${subjectPrefix}-lesson-${i}`,
    title: t,
    content: `Learn about ${t}. This module covers the fundamentals, key concepts, hands-on practice steps, and real-world applications of ${t}. Follow the structured guide below to master this topic.`,
  }));

const makeActivities = (titles: string[], subjectPrefix: string, startIdx = 0): Activity[] =>
  titles.map((t, i) => ({
    id: `${subjectPrefix}-act-${startIdx + i}`,
    title: t,
    description: `Complete this ${t.toLowerCase().includes("project") ? "project" : "activity"} to practice what you learned.`,
    type: t.toLowerCase().includes("project") ? "project" : "activity",
  }));

export const CURRICULUM: ClassCurriculum[] = [
  // =================== CLASS 1 ===================
  {
    classId: "1st",
    className: "Class 1",
    subjects: [
      {
        id: "c1-it", title: "IT Skills", icon: "Monitor", color: "neon-blue",
        topics: [
          {
            id: "c1-it-intro", title: "Introduction to Computers",
            lessons: makeLessons(["What is a Computer?", "Parts of a Computer", "Using a Mouse", "Using a Keyboard"], "c1-it"),
            activities: makeActivities(["Activity: Identify Computer Parts", "Project: Draw Your Computer", "Project: My Computer Story"], "c1-it"),
          },
        ],
      },
      {
        id: "c1-paint", title: "Fun with Paint", icon: "Palette", color: "neon-orange",
        topics: [
          {
            id: "c1-paint-start", title: "Starting Paint",
            lessons: makeLessons(["Opening Paint Application", "Paint Window Overview"], "c1-paint-s"),
            activities: makeActivities(["Activity: Open and Close Paint"], "c1-paint-s"),
          },
          {
            id: "c1-paint-parts", title: "Parts of Paint",
            lessons: makeLessons(["Menu Bar", "Tool Box", "Color Palette", "Drawing Area"], "c1-paint-p"),
            activities: makeActivities(["Activity: Explore Paint Tools"], "c1-paint-p"),
          },
          {
            id: "c1-paint-shapes", title: "Drawing Shapes",
            lessons: makeLessons(["Drawing Lines", "Drawing Rectangles", "Drawing Circles & Ovals", "Using Freeform Tool"], "c1-paint-sh"),
            activities: makeActivities(["Activity: Draw a House", "Project: Shape Art", "Project: My Favorite Animal"], "c1-paint-sh"),
          },
          {
            id: "c1-paint-color", title: "Coloring a Shape",
            lessons: makeLessons(["Fill with Color Tool", "Choosing Colors", "Background Color"], "c1-paint-c"),
            activities: makeActivities(["Activity: Color a Garden", "Project: Rainbow Drawing", "Project: Colorful Scenery"], "c1-paint-c"),
          },
        ],
      },
      {
        id: "c1-scratch", title: "Intro to Scratch Jr", icon: "Gamepad2", color: "neon-green",
        topics: [
          {
            id: "c1-scratch-work", title: "Working on Scratch Jr",
            lessons: makeLessons(["What is Scratch Jr?", "Opening Scratch Jr", "The Scratch Jr Interface"], "c1-scj-w"),
            activities: makeActivities(["Activity: Explore Scratch Jr"], "c1-scj-w"),
          },
          {
            id: "c1-scratch-comp", title: "Components",
            lessons: makeLessons(["Stage Area", "Block Palette", "Scripts Area", "Sprite List"], "c1-scj-c"),
            activities: makeActivities(["Activity: Identify All Components"], "c1-scj-c"),
          },
          {
            id: "c1-scratch-text", title: "Add Text",
            lessons: makeLessons(["Adding Text to Stage", "Changing Text Style"], "c1-scj-t"),
            activities: makeActivities(["Activity: Write Your Name"], "c1-scj-t"),
          },
          {
            id: "c1-scratch-char", title: "New Character & Background",
            lessons: makeLessons(["Adding a New Character", "Choosing a Background", "Customizing Characters"], "c1-scj-ch"),
            activities: makeActivities(["Activity: Create a Scene"], "c1-scj-ch"),
          },
          {
            id: "c1-scratch-move", title: "Move a Sprite",
            lessons: makeLessons(["Motion Blocks", "Moving Forward & Back", "Making Sprite Dance"], "c1-scj-m"),
            activities: makeActivities(["Activity 1: Make Cat Walk", "Activity 2: Dancing Sprite", "Project: My First Animation", "Project: Sprite Story"], "c1-scj-m"),
          },
        ],
      },
    ],
  },
  // =================== CLASS 2 ===================
  {
    classId: "2nd",
    className: "Class 2",
    subjects: [
      {
        id: "c2-it", title: "IT Skills", icon: "Monitor", color: "neon-blue",
        topics: [
          {
            id: "c2-it-adv", title: "Advanced Computer Basics",
            lessons: makeLessons(["Types of Computers", "Input & Output Devices", "Starting & Shutting Down", "Files and Folders"], "c2-it"),
            activities: makeActivities(["Activity: Sort Devices", "Project: My Device Book", "Project: Computer Usage Diary"], "c2-it"),
          },
        ],
      },
      {
        id: "c2-paint", title: "Working in Paint", icon: "Palette", color: "neon-orange",
        topics: [
          {
            id: "c2-paint-adv", title: "Advanced Paint Techniques",
            lessons: makeLessons(["Selection Tools", "Copy & Paste", "Resize & Rotate", "Text Tool in Paint", "Saving Your Artwork"], "c2-paint"),
            activities: makeActivities(["Activity: Create a Greeting Card", "Project: Digital Poster", "Project: Comic Strip"], "c2-paint"),
          },
        ],
      },
      {
        id: "c2-word", title: "MS Word Basics", icon: "FileText", color: "neon-purple",
        topics: [
          {
            id: "c2-word-intro", title: "Introduction to MS Word",
            lessons: makeLessons(["Opening MS Word", "Word Interface", "Typing Text", "Saving a Document", "Formatting Basics"], "c2-word"),
            activities: makeActivities(["Activity: Type a Paragraph", "Project: My First Letter", "Project: Story Writing"], "c2-word"),
          },
        ],
      },
      {
        id: "c2-scratch", title: "Scratch Jr Advanced", icon: "Gamepad2", color: "neon-green",
        topics: [
          {
            id: "c2-scj-adv", title: "Advanced Scratch Jr",
            lessons: makeLessons(["Repeat Blocks", "Speed Control", "Sound Blocks", "Multi-Page Stories", "Sharing Projects"], "c2-scj"),
            activities: makeActivities(["Activity: Animated Story", "Project: Interactive Greeting", "Project: Mini Game"], "c2-scj"),
          },
        ],
      },
    ],
  },
  // =================== CLASS 3 ===================
  {
    classId: "3rd",
    className: "Class 3",
    subjects: [
      {
        id: "c3-ipo", title: "Input – Process – Output", icon: "Cpu", color: "neon-blue",
        topics: [{
          id: "c3-ipo-main", title: "Understanding IPO",
          lessons: makeLessons(["What is Input?", "What is Processing?", "What is Output?", "IPO in Daily Life", "IPO in Computers"], "c3-ipo"),
          activities: makeActivities(["Activity: IPO Examples", "Project: IPO Chart", "Project: Real-World IPO"], "c3-ipo"),
        }],
      },
      {
        id: "c3-os", title: "Operating System (Windows)", icon: "Monitor", color: "neon-purple",
        topics: [{
          id: "c3-os-win", title: "Windows Basics",
          lessons: makeLessons(["What is an OS?", "Windows Desktop", "Taskbar & Start Menu", "File Explorer", "Creating Folders"], "c3-os"),
          activities: makeActivities(["Activity: Navigate Windows", "Project: Organize Files", "Project: Desktop Customization"], "c3-os"),
        }],
      },
      {
        id: "c3-paint", title: "Know More About Paint", icon: "Palette", color: "neon-orange",
        topics: [{
          id: "c3-paint-more", title: "Advanced Paint Features",
          lessons: makeLessons(["Brush Styles", "Airbrush Tool", "Color Picker", "Transparency", "Layers in Paint 3D"], "c3-paint"),
          activities: makeActivities(["Activity: Gradient Art", "Project: Digital Landscape", "Project: Logo Design"], "c3-paint"),
        }],
      },
      {
        id: "c3-word", title: "MS Word", icon: "FileText", color: "neon-blue",
        topics: [{
          id: "c3-word-adv", title: "Word Processing Skills",
          lessons: makeLessons(["Font Formatting", "Paragraph Alignment", "Bullets & Numbering", "Inserting Images", "Page Borders"], "c3-word"),
          activities: makeActivities(["Activity: Format a Story", "Project: Class Newsletter", "Project: Invitation Card"], "c3-word"),
        }],
      },
      {
        id: "c3-scratch-intro", title: "Introduction to Scratch", icon: "Gamepad2", color: "neon-green",
        topics: [
          {
            id: "c3-scr-start", title: "Starting Scratch",
            lessons: makeLessons(["What is Scratch?", "Scratch vs Scratch Jr", "Opening Scratch", "The Scratch Editor"], "c3-scr-s"),
            activities: makeActivities(["Activity: Explore Scratch Editor"], "c3-scr-s"),
          },
          {
            id: "c3-scr-comp", title: "Components & Drag-Drop",
            lessons: makeLessons(["Blocks Categories", "Drag & Drop Blocks", "Connecting Blocks", "Running Scripts"], "c3-scr-c"),
            activities: makeActivities(["Activity: Build First Script"], "c3-scr-c"),
          },
          {
            id: "c3-scr-sprite", title: "Moving & Saving",
            lessons: makeLessons(["Motion Blocks", "Moving a Sprite", "Glide & Turn", "Saving Your Project"], "c3-scr-sp"),
            activities: makeActivities(["Activity 1: Sprite Walk", "Activity 2: Sprite Dance", "Project: Maze Runner", "Project: Animal Race"], "c3-scr-sp"),
          },
        ],
      },
      {
        id: "c3-scratch-work", title: "Working in Scratch", icon: "Code", color: "neon-green",
        topics: [
          {
            id: "c3-scr-appear", title: "Change Appearance",
            lessons: makeLessons(["Costumes", "Switching Costumes", "Size Changes", "Show & Hide"], "c3-scr-a"),
            activities: makeActivities(["Activity: Costume Animation"], "c3-scr-a"),
          },
          {
            id: "c3-scr-say", title: "Make Sprite Say Something",
            lessons: makeLessons(["Say Block", "Think Block", "Timed Messages"], "c3-scr-say"),
            activities: makeActivities(["Activity: Talking Sprite"], "c3-scr-say"),
          },
          {
            id: "c3-scr-sound", title: "Add Sound & Music",
            lessons: makeLessons(["Sound Library", "Play Sound Block", "Record Sound", "Music Extension"], "c3-scr-snd"),
            activities: makeActivities(["Activity: Musical Sprite", "Project: Interactive Story", "Project: Musical Instrument"], "c3-scr-snd"),
          },
        ],
      },
    ],
  },
  // =================== CLASS 4 ===================
  {
    classId: "4th",
    className: "Class 4",
    subjects: [
      {
        id: "c4-devices", title: "Computer Devices", icon: "Monitor", color: "neon-blue",
        topics: [{
          id: "c4-dev", title: "Input & Output Devices",
          lessons: makeLessons(["Input Devices", "Output Devices", "Pointing Devices", "Special Devices", "Wireless vs Wired"], "c4-dev"),
          activities: makeActivities(["Activity: Device Classification", "Project: Device Catalog", "Project: Future Devices"], "c4-dev"),
        }],
      },
      {
        id: "c4-memory", title: "Memory & Storage Devices", icon: "HardDrive", color: "neon-purple",
        topics: [{
          id: "c4-mem", title: "Types of Memory & Storage",
          lessons: makeLessons(["RAM vs ROM", "Primary Memory", "Secondary Storage", "USB Drives & CDs", "Cloud Storage"], "c4-mem"),
          activities: makeActivities(["Activity: Memory Quiz", "Project: Storage Comparison Chart", "Project: Memory Presentation"], "c4-mem"),
        }],
      },
      {
        id: "c4-windows", title: "Working in Windows", icon: "AppWindow", color: "neon-orange",
        topics: [{
          id: "c4-win", title: "Windows Advanced",
          lessons: makeLessons(["Control Panel", "System Settings", "Installing Programs", "Task Manager", "Accessories"], "c4-win"),
          activities: makeActivities(["Activity: Customize Settings", "Project: Windows Guide", "Project: Troubleshooting Steps"], "c4-win"),
        }],
      },
      {
        id: "c4-word", title: "MS Word Advanced", icon: "FileText", color: "neon-blue",
        topics: [{
          id: "c4-word-adv", title: "Text Formatting & Objects",
          lessons: makeLessons(["Bold, Italic, Underline", "Font Color & Highlighting", "WordArt", "Inserting Shapes", "Tables in Word", "Headers & Footers"], "c4-word"),
          activities: makeActivities(["Activity: Format a Report", "Project: School Magazine Page", "Project: Birthday Card"], "c4-word"),
        }],
      },
      {
        id: "c4-ppt", title: "MS PowerPoint", icon: "Presentation", color: "neon-orange",
        topics: [
          {
            id: "c4-ppt-intro", title: "Introduction & Components",
            lessons: makeLessons(["What is PowerPoint?", "PowerPoint Interface", "Ribbon & Tools"], "c4-ppt-i"),
            activities: makeActivities(["Activity: Explore PPT Interface"], "c4-ppt-i"),
          },
          {
            id: "c4-ppt-slides", title: "Slides & Templates",
            lessons: makeLessons(["Creating Slides", "Slide Layouts", "Using Templates", "Adding Content", "Slideshow Mode"], "c4-ppt-sl"),
            activities: makeActivities(["Activity: Create 5-Slide Presentation", "Project: About Me Presentation", "Project: Animal Kingdom PPT"], "c4-ppt-sl"),
          },
        ],
      },
      {
        id: "c4-scratch", title: "Scratch Programming", icon: "Gamepad2", color: "neon-green",
        topics: [{
          id: "c4-scr", title: "Multiple Sprites & Media",
          lessons: makeLessons(["Adding Multiple Sprites", "Sprite Interaction", "Import Sound Effects", "Add Background Music", "Backdrop Changes"], "c4-scr"),
          activities: makeActivities(["Activity: Multi-Sprite Scene", "Project: Animated Story", "Project: Simple Quiz Game"], "c4-scr"),
        }],
      },
    ],
  },
  // =================== CLASS 5 ===================
  {
    classId: "5th",
    className: "Class 5",
    subjects: [
      {
        id: "c5-word", title: "MS Word – Page Formatting", icon: "FileText", color: "neon-blue",
        topics: [{
          id: "c5-word-pf", title: "Page Layout & Design",
          lessons: makeLessons(["Page Margins", "Page Orientation", "Page Background Color", "Watermarks", "Page Borders", "Columns"], "c5-word"),
          activities: makeActivities(["Activity: Format a Magazine Page", "Project: Formatted Report", "Project: Class Brochure"], "c5-word"),
        }],
      },
      {
        id: "c5-ppt", title: "MS PPT – Animations", icon: "Presentation", color: "neon-orange",
        topics: [{
          id: "c5-ppt-anim", title: "Animations, Transitions & Media",
          lessons: makeLessons(["Slide Transitions", "Animation Effects", "Animation Timing", "Inserting Audio", "Inserting Video", "Custom Animations"], "c5-ppt"),
          activities: makeActivities(["Activity: Animated Slideshow", "Project: Science Presentation", "Project: Story Animation PPT"], "c5-ppt"),
        }],
      },
      {
        id: "c5-excel-intro", title: "MS Excel Introduction", icon: "Table", color: "neon-purple",
        topics: [{
          id: "c5-xl-intro", title: "Getting Started with Excel",
          lessons: makeLessons(["What is Excel?", "Excel Interface", "Workbooks & Worksheets", "Cells, Rows, Columns", "Entering Data"], "c5-xl-i"),
          activities: makeActivities(["Activity: Create First Spreadsheet", "Project: Class Timetable", "Project: Birthday List"], "c5-xl-i"),
        }],
      },
      {
        id: "c5-excel-work", title: "MS Excel Working", icon: "Table", color: "neon-purple",
        topics: [
          {
            id: "c5-xl-cells", title: "Selecting & Formatting Cells",
            lessons: makeLessons(["Selecting Cells & Ranges", "Changing Font & Size", "Cell Alignment", "Adding Borders", "Cell Background Color"], "c5-xl-c"),
            activities: makeActivities(["Activity: Format a Data Table"], "c5-xl-c"),
          },
          {
            id: "c5-xl-edit", title: "Insert, Delete & Resize",
            lessons: makeLessons(["Insert Rows & Columns", "Delete Rows & Columns", "Resize Rows & Columns", "Merge Cells", "Wrap Text"], "c5-xl-e"),
            activities: makeActivities(["Activity: Build a Mark Sheet", "Project: Monthly Budget", "Project: Sports Score Card"], "c5-xl-e"),
          },
        ],
      },
      {
        id: "c5-scratch", title: "Scratch – Blocks & Variables", icon: "Gamepad2", color: "neon-green",
        topics: [{
          id: "c5-scr", title: "Blocks, Operators & Variables",
          lessons: makeLessons(["Control Blocks", "Sensing Blocks", "Operator Blocks", "Creating Variables", "Using Variables in Games", "Broadcasting Messages"], "c5-scr"),
          activities: makeActivities(["Activity: Variable Counter", "Project: Score Keeping Game", "Project: Interactive Quiz"], "c5-scr"),
        }],
      },
    ],
  },
  // =================== CLASS 6 ===================
  {
    classId: "6th",
    className: "Class 6",
    subjects: [
      {
        id: "c6-excel", title: "MS Excel – Formulas & Database", icon: "Table", color: "neon-purple",
        topics: [{
          id: "c6-xl", title: "Formulas & Database Concepts",
          lessons: makeLessons(["SUM Formula", "AVERAGE Formula", "MAX & MIN", "COUNT Functions", "Database Concepts in Excel", "Sorting & Filtering"], "c6-xl"),
          activities: makeActivities(["Activity: Calculate Class Marks", "Project: Student Database", "Project: Sales Report"], "c6-xl"),
        }],
      },
      {
        id: "c6-gimp", title: "GIMP", icon: "Image", color: "neon-orange",
        topics: [
          {
            id: "c6-gimp-intro", title: "Introduction to GIMP",
            lessons: makeLessons(["What is GIMP?", "GIMP Interface", "Toolbox Overview", "Opening & Saving Images"], "c6-gimp-i"),
            activities: makeActivities(["Activity: Explore GIMP Tools"], "c6-gimp-i"),
          },
          {
            id: "c6-gimp-select", title: "Selection Tools",
            lessons: makeLessons(["Rectangle Select", "Ellipse Select", "Free Select", "Fuzzy Select (Magic Wand)", "Select by Color"], "c6-gimp-s"),
            activities: makeActivities(["Activity: Cut & Paste Selections", "Project: Photo Collage", "Project: Background Removal"], "c6-gimp-s"),
          },
        ],
      },
      {
        id: "c6-html", title: "HTML", icon: "Code", color: "neon-blue",
        topics: [
          {
            id: "c6-html-intro", title: "Introduction to HTML",
            lessons: makeLessons(["What is HTML?", "How Websites Work", "Creating an HTML Document", "HTML File Structure"], "c6-html-i"),
            activities: makeActivities(["Activity: Create First HTML Page"], "c6-html-i"),
          },
          {
            id: "c6-html-tags", title: "HTML Tags & Elements",
            lessons: makeLessons(["Heading Tags (h1-h6)", "Paragraph Tag", "Line Break & Horizontal Rule", "Bold, Italic, Underline", "HTML Structure (html, head, body)"], "c6-html-t"),
            activities: makeActivities(["Activity: Build a Profile Page", "Project: My School Website", "Project: Hobby Page"], "c6-html-t"),
          },
        ],
      },
      {
        id: "c6-css", title: "CSS", icon: "Paintbrush", color: "neon-green",
        topics: [
          {
            id: "c6-css-intro", title: "Introduction & Methods",
            lessons: makeLessons(["What is CSS?", "Inline CSS", "Internal CSS", "External CSS", "CSS Selectors"], "c6-css-i"),
            activities: makeActivities(["Activity: Style a Page 3 Ways"], "c6-css-i"),
          },
          {
            id: "c6-css-props", title: "CSS Properties",
            lessons: makeLessons(["Background Color & Image", "Text Color & Alignment", "Font Family & Size", "Margins", "Borders & Padding"], "c6-css-p"),
            activities: makeActivities(["Activity: Beautiful Profile Page", "Project: Styled School Website", "Project: CSS Art Gallery"], "c6-css-p"),
          },
        ],
      },
      {
        id: "c6-ai", title: "AI Activities", icon: "Sparkles", color: "neon-pink",
        topics: [{
          id: "c6-ai-act", title: "Exploring Artificial Intelligence",
          lessons: makeLessons(["What is AI?", "AI in Daily Life", "How AI Learns", "AI vs Human Intelligence"], "c6-ai"),
          activities: makeActivities(["AI Activity 1: Teachable Machine", "AI Activity 2: AI Image Recognition", "Project: AI Use Case Presentation", "Project: Design an AI Assistant"], "c6-ai"),
        }],
      },
    ],
  },
  // =================== CLASS 7 ===================
  {
    classId: "7th",
    className: "Class 7",
    subjects: [
      {
        id: "c7-excel", title: "MS Excel Charts", icon: "BarChart3", color: "neon-purple",
        topics: [{
          id: "c7-xl", title: "Creating Charts in Excel",
          lessons: makeLessons(["Chart Types Overview", "Creating Bar Charts", "Creating Pie Charts", "Line Charts", "Formatting Charts", "Chart Titles & Legends"], "c7-xl"),
          activities: makeActivities(["Activity 1: Population Bar Chart", "Activity 2: Budget Pie Chart", "Project: Data Visualization Report", "Project: Survey Results Dashboard"], "c7-xl"),
        }],
      },
      {
        id: "c7-gimp", title: "GIMP Layers", icon: "Layers", color: "neon-orange",
        topics: [{
          id: "c7-gimp", title: "Working with Layers",
          lessons: makeLessons(["Understanding Layers", "Creating Layers", "Layer Order", "Layer Opacity", "Merge & Flatten", "Layer Masks"], "c7-gimp-l"),
          activities: makeActivities(["Activity 1: Multi-Layer Design", "Activity 2: Photo Manipulation", "Project: Movie Poster", "Project: Album Cover"], "c7-gimp-l"),
        }],
      },
      {
        id: "c7-html", title: "HTML Advanced", icon: "Code", color: "neon-blue",
        topics: [{
          id: "c7-html", title: "Lists, Tables, Images, Links & Frames",
          lessons: makeLessons(["Ordered & Unordered Lists", "HTML Tables", "Table Formatting", "Inserting Images", "Hyperlinks", "Iframes"], "c7-html-a"),
          activities: makeActivities(["Activity 1: Recipe Page with Lists", "Activity 2: Data Table Page", "Project: Multi-Page Website", "Project: Photo Gallery"], "c7-html-a"),
        }],
      },
      {
        id: "c7-python-intro", title: "Python Introduction", icon: "Terminal", color: "neon-green",
        topics: [{
          id: "c7-py-intro", title: "Getting Started with Python",
          lessons: makeLessons(["What is Python?", "Installing Python", "Python Shell (IDLE)", "Print Statement", "Comments", "Variables & Data Types"], "c7-py-i"),
          activities: makeActivities(["Activity 1: Hello World Program", "Activity 2: Personal Info Printer", "Project: Mad Libs Game", "Project: Simple Calculator"], "c7-py-i"),
        }],
      },
      {
        id: "c7-python-ops", title: "Python Input & Operators", icon: "Terminal", color: "neon-green",
        topics: [{
          id: "c7-py-ops", title: "Input Function & Operators",
          lessons: makeLessons(["input() Function", "Type Conversion", "Arithmetic Operators", "Comparison Operators", "Logical Operators", "String Operations"], "c7-py-o"),
          activities: makeActivities(["Activity 1: Interactive Greeter", "Activity 2: Age Calculator", "Project: Unit Converter", "Project: Quiz Game"], "c7-py-o"),
        }],
      },
      {
        id: "c7-ai", title: "AI Activities", icon: "Sparkles", color: "neon-pink",
        topics: [{
          id: "c7-ai-act", title: "AI Projects & Exploration",
          lessons: makeLessons(["Machine Learning Basics", "Training Data Concepts", "AI Ethics", "AI in Healthcare & Education"], "c7-ai"),
          activities: makeActivities(["AI Activity 1: Train a Classifier", "AI Activity 2: Chatbot Basics", "Project: AI Ethics Debate", "Project: AI Solution Proposal"], "c7-ai"),
        }],
      },
    ],
  },
  // =================== CLASS 8 ===================
  {
    classId: "8th",
    className: "Class 8",
    subjects: [
      {
        id: "c8-access-intro", title: "MS Access", icon: "Database", color: "neon-purple",
        topics: [
          {
            id: "c8-acc-intro", title: "Introduction & Components",
            lessons: makeLessons(["What is MS Access?", "Access Interface", "Database Concepts", "Opening Access"], "c8-acc-i"),
            activities: makeActivities(["Activity: Explore Access Interface"], "c8-acc-i"),
          },
          {
            id: "c8-acc-db", title: "Creating Database & Tables",
            lessons: makeLessons(["Create a New Database", "Data Types", "Creating Tables", "Adding Fields", "Entering Records", "Filtering Data"], "c8-acc-db"),
            activities: makeActivities(["Activity 1: Student Database", "Activity 2: Library Catalog", "Project: School Records System", "Project: Inventory Manager"], "c8-acc-db"),
          },
        ],
      },
      {
        id: "c8-access-queries", title: "MS Access Queries", icon: "Database", color: "neon-purple",
        topics: [{
          id: "c8-acc-q", title: "Relations, Queries, Forms & Reports",
          lessons: makeLessons(["Table Relationships", "Creating a Query", "Query Criteria", "Creating Forms", "Form Design", "Creating Reports", "Report Formatting"], "c8-acc-q"),
          activities: makeActivities(["Activity 1: Query Builder", "Activity 2: Form Designer", "Project: Complete Database App", "Project: Report Generator"], "c8-acc-q"),
        }],
      },
      {
        id: "c8-krita", title: "KRITA", icon: "Palette", color: "neon-orange",
        topics: [{
          id: "c8-krita-intro", title: "Introduction to KRITA",
          lessons: makeLessons(["What is KRITA?", "KRITA Interface", "Brushes & Tools", "Canvas Setup", "Drawing Basics", "Saving & Exporting"], "c8-kr-i"),
          activities: makeActivities(["Activity: Digital Sketch", "Project: Character Design", "Project: Digital Painting"], "c8-kr-i"),
        }],
      },
      {
        id: "c8-krita-layers", title: "KRITA Layers & Animation", icon: "Layers", color: "neon-orange",
        topics: [{
          id: "c8-krita-la", title: "Layers & Frame Animation",
          lessons: makeLessons(["Layer Management", "Blending Modes", "Animation Timeline", "Onion Skinning", "Frame-by-Frame Animation", "Exporting Animations"], "c8-kr-la"),
          activities: makeActivities(["Activity: Animated Character", "Project: Short Animation", "Project: Animated Logo"], "c8-kr-la"),
        }],
      },
      {
        id: "c8-python", title: "Python Control Statements", icon: "Terminal", color: "neon-green",
        topics: [{
          id: "c8-py-ctrl", title: "If-Else, Loops & Functions",
          lessons: makeLessons(["if Statement", "if-else Statement", "if-elif-else", "for Loop", "while Loop", "break & continue", "Defining Functions"], "c8-py-c"),
          activities: makeActivities(["Activity 1: Grade Calculator", "Activity 2: Number Guessing Game", "Project: Rock Paper Scissors", "Project: Password Generator"], "c8-py-c"),
        }],
      },
      {
        id: "c8-canva", title: "Canva", icon: "Layout", color: "neon-pink",
        topics: [{
          id: "c8-canva", title: "Graphic Design with Canva",
          lessons: makeLessons(["What is Canva?", "Canva Interface", "Templates & Designs", "Text & Typography", "Images & Elements", "Sharing & Downloading"], "c8-canva"),
          activities: makeActivities(["Activity: Design a Social Post", "Project: Event Poster", "Project: Infographic"], "c8-canva"),
        }],
      },
      {
        id: "c8-appinv", title: "MIT App Inventor", icon: "Smartphone", color: "neon-blue",
        topics: [{
          id: "c8-appinv", title: "Mobile App Development",
          lessons: makeLessons(["What is App Inventor?", "Designer View", "Blocks View", "Components", "Events & Handlers", "Testing on Phone"], "c8-appinv"),
          activities: makeActivities(["Activity: Hello World App", "Project: Calculator App", "Project: Quiz App"], "c8-appinv"),
        }],
      },
    ],
  },
];

// Get curriculum for a specific class
// Handles formats: "5", "5th", "Class 5", "5 (A)", "5th (B)", "Class 5 (A)" etc.
export const getCurriculumForClass = (classId: string): ClassCurriculum | undefined => {
  if (!classId) return undefined;
  // Extract the first number from the string
  const numMatch = classId.match(/(\d+)/);
  if (!numMatch) return undefined;
  const n = parseInt(numMatch[1]);
  const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  const normalized = `${n}${suffix}`;
  return CURRICULUM.find((c) => c.classId.toLowerCase() === normalized.toLowerCase());
};

// Count total topics in a curriculum
export const countTotalTopics = (curriculum: ClassCurriculum): number => {
  return curriculum.subjects.reduce((sum, sub) => sum + sub.topics.length, 0);
};

// Get all topic IDs for a class
export const getAllTopicIds = (curriculum: ClassCurriculum): string[] => {
  return curriculum.subjects.flatMap((sub) => sub.topics.map((t) => t.id));
};

// Count all activities and projects
export const countActivitiesAndProjects = (curriculum: ClassCurriculum) => {
  let activities = 0, projects = 0;
  curriculum.subjects.forEach((sub) =>
    sub.topics.forEach((topic) =>
      topic.activities.forEach((act) => {
        if (act.type === "project") projects++;
        else activities++;
      })
    )
  );
  return { activities, projects };
};
