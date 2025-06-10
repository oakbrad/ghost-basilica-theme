# Ghost Table Roller Template

This template allows you to create RPG-style random table rolls in your Ghost posts. When a user clicks the "Roll on Table" button, the script will randomly select an entry from your markdown table and display it.

## How to Use

1. Create a new post in Ghost
2. In the post settings (gear icon), select "custom-table-roller" as the template
3. Add your content to the post, including a markdown table with your random table entries
4. Publish the post

## Table Format

The table roller will use the first markdown table it finds in your post content. The table should be formatted as follows:

```markdown
| Roll | Result |
|------|--------|
| 1    | First result |
| 2    | Second result |
| 3    | Third result |
| ...  | ... |
```

The script will use the second column (Result) for the random roll. If your table only has one column, it will use that column.

## Example

Here's an example of a random encounter table:

```markdown
| d20 | Wilderness Encounter |
|-----|---------------------|
| 1   | A lost traveler seeking directions |
| 2   | 2d4 goblins arguing over a shiny trinket |
| 3   | An abandoned campsite with still-warm embers |
| 4   | A merchant's cart with a broken wheel |
| 5   | A circle of mushrooms with strange glowing spores |
| 6   | A wounded wolf licking its injuries |
| 7   | A small shrine to an unknown deity |
| 8   | 1d6 bandits hiding in ambush |
| 9   | A talking raven with cryptic messages |
| 10  | A patch of poisonous plants |
| 11  | A hunter tracking rare game |
| 12  | An old battlefield with scattered equipment |
| 13  | A mysterious fog that whispers secrets |
| 14  | A wandering bard looking for inspiration |
| 15  | A magical spring with restorative properties |
| 16  | 2d6 zombies shambling through the trees |
| 17  | A sleeping ogre under a large tree |
| 18  | A fairy ring - those who step inside must save or be charmed |
| 19  | A griffon flying overhead, searching for prey |
| 20  | A wizard's tower appears suddenly on the horizon |
```

## Technical Details

The table roller works by:
1. Finding the first markdown table in your post content
2. Extracting all rows except the header
3. When the button is clicked, randomly selecting one of the entries
4. Displaying the selected entry in the result area

The table itself remains visible in your post content, so readers can see all possible results.

