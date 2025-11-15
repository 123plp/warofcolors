import { useState } from "react";
import { Plus, Trash2, DoorOpen, Edit3, Box, Grid3x3, SplitSquareHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShapeEditor } from "./ShapeEditor";

interface RoomSection {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Door {
  id: string;
  position: "top" | "right" | "bottom" | "left";
  offset: number; // percentage along the wall
}

interface InternalWall {
  id: string;
  orientation: "horizontal" | "vertical";
  position: number; // percentage
}

interface SubRoom {
  id: string;
  name: string;
  area: number; // which divided area (0 or 1)
}

interface Room {
  id: string;
  name: string;
  type: string;
  sections: RoomSection[];
  doors: Door[];
  connections: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  gridShape?: boolean[][];
  internalWalls?: InternalWall[];
  subRooms?: SubRoom[];
}

interface RoomEditorProps {
  room: Room | null;
  open: boolean;
  onClose: () => void;
  onSave: (room: Room) => void;
}

export const RoomEditor = ({ room, open, onClose, onSave }: RoomEditorProps) => {
  const [editedRoom, setEditedRoom] = useState<Room | null>(room);
  const [shapeEditMode, setShapeEditMode] = useState(false);

  const handleShapeChange = (shape: boolean[][]) => {
    if (!editedRoom) return;
    setEditedRoom({ ...editedRoom, gridShape: shape });
  };

  const handleAddInternalWall = () => {
    if (!editedRoom) return;
    
    const newWall: InternalWall = {
      id: `wall-${Date.now()}`,
      orientation: "horizontal",
      position: 50,
    };

    setEditedRoom({
      ...editedRoom,
      internalWalls: [...(editedRoom.internalWalls || []), newWall],
      subRooms: editedRoom.subRooms || [
        { id: `sub-${Date.now()}-1`, name: `${editedRoom.name} A`, area: 0 },
        { id: `sub-${Date.now()}-2`, name: `${editedRoom.name} B`, area: 1 },
      ],
    });
    toast.success("Internal wall added - room split into sub-rooms");
  };

  const handleRemoveInternalWall = (wallId: string) => {
    if (!editedRoom) return;
    
    const walls = editedRoom.internalWalls?.filter(w => w.id !== wallId) || [];
    setEditedRoom({
      ...editedRoom,
      internalWalls: walls,
      subRooms: walls.length === 0 ? [] : editedRoom.subRooms,
    });
    toast.success("Internal wall removed");
  };

  const handleUpdateInternalWall = (wallId: string, updates: Partial<InternalWall>) => {
    if (!editedRoom) return;
    
    setEditedRoom({
      ...editedRoom,
      internalWalls: editedRoom.internalWalls?.map(w => 
        w.id === wallId ? { ...w, ...updates } : w
      ),
    });
  };

  const handleAddSection = () => {
    if (!editedRoom) return;
    
    const newSection: RoomSection = {
      id: `section-${Date.now()}`,
      x: editedRoom.width,
      y: 0,
      width: editedRoom.width / 2,
      height: editedRoom.height,
    };

    setEditedRoom({
      ...editedRoom,
      sections: [...editedRoom.sections, newSection],
    });
    toast.success("Section added - internal lines auto-removed");
  };

  const handleRemoveSection = (sectionId: string) => {
    if (!editedRoom) return;
    
    setEditedRoom({
      ...editedRoom,
      sections: editedRoom.sections.filter(s => s.id !== sectionId),
    });
    toast.success("Section removed");
  };

  const handleAddDoor = () => {
    if (!editedRoom) return;
    
    const newDoor: Door = {
      id: `door-${Date.now()}`,
      position: "top",
      offset: 50,
    };

    setEditedRoom({
      ...editedRoom,
      doors: [...editedRoom.doors, newDoor],
    });
    toast.success("Door added");
  };

  const handleRemoveDoor = (doorId: string) => {
    if (!editedRoom) return;
    
    setEditedRoom({
      ...editedRoom,
      doors: editedRoom.doors.filter(d => d.id !== doorId),
    });
    toast.success("Door removed");
  };

  const handleUpdateDoor = (doorId: string, updates: Partial<Door>) => {
    if (!editedRoom) return;
    
    setEditedRoom({
      ...editedRoom,
      doors: editedRoom.doors.map(d => 
        d.id === doorId ? { ...d, ...updates } : d
      ),
    });
  };

  const handleSave = () => {
    if (editedRoom) {
      onSave(editedRoom);
      toast.success("Room updated");
      onClose();
    }
  };

  if (!editedRoom) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Room: {editedRoom.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label>Room Name</Label>
              <Input
                value={editedRoom.name}
                onChange={(e) => setEditedRoom({ ...editedRoom, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Room Type</Label>
              <Select
                value={editedRoom.type}
                onValueChange={(value) => setEditedRoom({ ...editedRoom, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="control">Control</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="containment">Containment</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="laboratory">Laboratory</SelectItem>
                  <SelectItem value="observation">Observation</SelectItem>
                  <SelectItem value="decontamination">Decontamination</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Width</Label>
              <Input
                type="number"
                value={editedRoom.width}
                onChange={(e) => setEditedRoom({ ...editedRoom, width: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Height</Label>
              <Input
                type="number"
                value={editedRoom.height}
                onChange={(e) => setEditedRoom({ ...editedRoom, height: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Custom Shape Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Custom Shape Editor</Label>
              <Button 
                size="sm" 
                variant={shapeEditMode ? "default" : "outline"}
                onClick={() => setShapeEditMode(!shapeEditMode)}
              >
                <Grid3x3 className="w-4 h-4 mr-1" />
                {shapeEditMode ? "Exit Shape Editor" : "Edit Shape"}
              </Button>
            </div>
            {shapeEditMode && (
              <ShapeEditor
                gridSize={12}
                initialShape={editedRoom.gridShape}
                onShapeChange={handleShapeChange}
              />
            )}
          </div>

          {/* Additional Sections for L-shaped rooms */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Additional Sections (for L-shaped rooms)</Label>
              <Button size="sm" onClick={handleAddSection}>
                <Plus className="w-4 h-4 mr-1" />
                Add Section
              </Button>
            </div>
            <div className="space-y-2">
              {editedRoom.sections.map((section) => (
                <div key={section.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Box className="w-4 h-4" />
                  <span className="text-sm flex-1">
                    Section {section.width}×{section.height}
                  </span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveSection(section.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {editedRoom.sections.length === 0 && (
                <p className="text-sm text-muted-foreground">No additional sections</p>
              )}
            </div>
          </div>

          {/* Internal Walls & Sub-Rooms */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Internal Walls (Sub-Rooms)</Label>
              <Button size="sm" onClick={handleAddInternalWall}>
                <Plus className="w-4 h-4 mr-1" />
                Add Wall
              </Button>
            </div>
            <div className="space-y-2">
              {editedRoom.internalWalls?.map((wall) => (
                <div key={wall.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <SplitSquareHorizontal className="w-4 h-4" />
                  <Select
                    value={wall.orientation}
                    onValueChange={(value: any) => handleUpdateInternalWall(wall.id, { orientation: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="10"
                    max="90"
                    value={wall.position}
                    onChange={(e) => handleUpdateInternalWall(wall.id, { position: parseInt(e.target.value) || 50 })}
                    className="w-20"
                    placeholder="Position %"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveInternalWall(wall.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {(!editedRoom.internalWalls || editedRoom.internalWalls.length === 0) && (
                <p className="text-sm text-muted-foreground">No internal walls</p>
              )}
            </div>
          </div>

          {/* Doors & Access Points */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Doors & Access Points</Label>
              <Button size="sm" onClick={handleAddDoor}>
                <Plus className="w-4 h-4 mr-1" />
                Add Door
              </Button>
            </div>
            <div className="space-y-2">
              {editedRoom.doors.map((door) => (
                <div key={door.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <DoorOpen className="w-4 h-4" />
                  <Select
                    value={door.position}
                    onValueChange={(value: any) => handleUpdateDoor(door.id, { position: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={door.offset}
                    onChange={(e) => handleUpdateDoor(door.id, { offset: parseInt(e.target.value) || 0 })}
                    className="w-20"
                    placeholder="Offset %"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveDoor(door.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {editedRoom.doors.length === 0 && (
                <p className="text-sm text-muted-foreground">No doors added</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};